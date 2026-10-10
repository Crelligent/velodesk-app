import type Stripe from 'stripe'
import type { Credentials, SignalSet, ValidationResult } from './signals'
import { throwIfAborted } from './http'

/** Stripe (customer's connected account via Connect OAuth): revenue + churn. Billing source. */
export const kind = 'billing' as const

export interface StripeMetrics {
    mrr: number // major units of `currency`
    totalRevenue: number
    currency: string // currency with the most MRR (upper-case ISO code)
    activeSubscriptions: number
    churnRate: number | null // % of subscriptions cancelled in the last 30 days
    churnBase: number
    mrrByCurrency: Record<string, number>
    revenueByCurrency: Record<string, number>
    recordsProcessed: number
    truncated: boolean
}

const MAX_STRIPE_RECORDS = 20000 // safety cap per resource
const ZERO_DECIMAL = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'])
const toMajor = (amount: number, currency: string) =>
    ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100

// Months per Stripe recurring interval
const INTERVAL_MONTHS: Record<string, number> = { day: 12 / 365, week: 12 / 52, month: 1, year: 12 }

/** Monthly recurring amount of one subscription item, in major units. */
function itemMonthlyAmount(item: Stripe.SubscriptionItem): number {
    const price = item.price
    const recurring = price.recurring
    if (!recurring || recurring.usage_type === 'metered') return 0
    const unit = price.unit_amount ?? (price.unit_amount_decimal ? Number(price.unit_amount_decimal) : 0)
    const months = (INTERVAL_MONTHS[recurring.interval] ?? 1) * (recurring.interval_count || 1)
    return toMajor(unit * (item.quantity ?? 1), price.currency) / months
}

async function client(accessToken: string, stripeUserId?: string) {
    const StripeSDK = (await import('stripe')).default
    return stripeUserId
        ? { stripe: new StripeSDK(process.env.STRIPE_SECRET_KEY!), requestOptions: { stripeAccount: stripeUserId } as Stripe.RequestOptions }
        : { stripe: new StripeSDK(accessToken), requestOptions: undefined }
}

const safeStripeError = (error: unknown) =>
    (error as { type?: string })?.type ?? (error instanceof Error ? error.name : 'unknown')

/**
 * GET /v1/subscriptions?status=active (auto-paginated), GET /v1/subscriptions?status=canceled,
 * GET /v1/charges, all with the Stripe-Account header for the connected account.
 * Reads the CUSTOMER's Stripe data. Prefers the platform key acting on the
 * connected account (Stripe-Account header); falls back to the OAuth access
 * token for connections made before stripe_user_id was stored.
 */
export async function getStripeMetrics(accessToken: string, stripeUserId?: string): Promise<StripeMetrics | null> {
    try {
        const { stripe, requestOptions } = await client(accessToken, stripeUserId)

        const mrrByCurrency: Record<string, number> = {}
        let activeSubscriptions = 0
        let truncated = false
        for await (const sub of stripe.subscriptions.list(
            { status: 'active', limit: 100 },
            requestOptions
        )) {
            throwIfAborted() // honour pmf-score's overall timeout between SDK pages
            activeSubscriptions++
            for (const item of sub.items.data) {
                const cur = item.price.currency.toUpperCase()
                mrrByCurrency[cur] = (mrrByCurrency[cur] || 0) + itemMonthlyAmount(item)
            }
            if (activeSubscriptions >= MAX_STRIPE_RECORDS) { truncated = true; break }
        }

        // Churn: subscriptions cancelled in the last 30 days (canceled list is ordered by
        // creation, so scan up to the cap and count by canceled_at)
        const cutoff = Math.floor(Date.now() / 1000) - 30 * 24 * 3600
        let churned = 0
        let canceledScanned = 0
        for await (const sub of stripe.subscriptions.list({ status: 'canceled', limit: 100 }, requestOptions)) {
            throwIfAborted()
            canceledScanned++
            if ((sub.canceled_at ?? sub.ended_at ?? 0) >= cutoff) churned++
            if (canceledScanned >= MAX_STRIPE_RECORDS) { truncated = true; break }
        }
        const churnBase = activeSubscriptions + churned
        const churnRate = churnBase > 0 ? Math.round((churned / churnBase) * 1000) / 10 : null

        const revenueByCurrency: Record<string, number> = {}
        let chargeCount = 0
        for await (const charge of stripe.charges.list({ limit: 100 }, requestOptions)) {
            throwIfAborted()
            chargeCount++
            if (charge.status === 'succeeded' && charge.paid) {
                const cur = charge.currency.toUpperCase()
                revenueByCurrency[cur] = (revenueByCurrency[cur] || 0) +
                    toMajor(charge.amount - (charge.amount_refunded || 0), charge.currency)
            }
            if (chargeCount >= MAX_STRIPE_RECORDS) { truncated = true; break }
        }

        // Headline figures in the currency with the most MRR (or revenue)
        const ranked = Object.entries(Object.keys(mrrByCurrency).length ? mrrByCurrency : revenueByCurrency)
            .sort((a, b) => b[1] - a[1])
        const currency = ranked[0]?.[0] ?? 'USD'
        const round = (n: number) => Math.round(n * 100) / 100

        return {
            mrr: round(mrrByCurrency[currency] || 0),
            totalRevenue: round(revenueByCurrency[currency] || 0),
            currency,
            activeSubscriptions,
            churnRate,
            churnBase,
            mrrByCurrency,
            revenueByCurrency,
            recordsProcessed: activeSubscriptions + canceledScanned + chargeCount,
            truncated,
        }
    } catch (error) {
        console.error('Stripe metrics error:', safeStripeError(error))
        return null
    }
}

/** GET /v1/subscriptions?limit=1 on the connected account */
export async function validate(c: Credentials, config?: Record<string, unknown> | null): Promise<ValidationResult> {
    try {
        const { stripe, requestOptions } = await client(c.accessToken ?? '', config?.stripe_user_id as string | undefined)
        await stripe.subscriptions.list({ limit: 1 }, requestOptions)
        return { ok: true }
    } catch (error) {
        return { ok: false, error: `Stripe rejected the connection (${safeStripeError(error)})` }
    }
}

export async function sync(c: Credentials, context?: { config?: Record<string, unknown> | null }): Promise<SignalSet> {
    const m = await getStripeMetrics(c.accessToken ?? '', context?.config?.stripe_user_id as string | undefined)
    if (!m) throw new Error('Stripe sync failed')
    return {
        revenue: {
            mrr: m.mrr,
            currency: m.currency,
            mrrByCurrency: Object.keys(m.mrrByCurrency).length ? m.mrrByCurrency : { [m.currency]: 0 },
            churnRate: m.churnRate,
            subscriptions: m.churnBase,
            expansionMrr: null, // needs subscription-change history (not read yet)
        },
        notes: m.truncated ? ['Stripe: record cap reached; figures may be partial'] : undefined,
    }
}
