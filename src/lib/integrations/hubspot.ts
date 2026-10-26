/**
 * HubSpot: deals won + contacts created per month (growth signal), plus the sales funnel
 * (win rate, deal speed, pipeline creation, lead to customer, renewals/upsells) for the
 * Go-to-Market Score and the CRM fallbacks for expansion and time to value. CRM source.
 * All of it needs only the two read scopes below, so existing connections get it too.
 * Credentials: { accessToken } (private app token; scopes crm.objects.deals.read, crm.objects.contacts.read)
 * Search API is limited to ~5 requests/second per account, so calls run sequentially.
 */
import { daysAgo, describeError, pctChange, requestJson, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'crm' as const

const BASE = 'https://api.hubapi.com'

const opts = (c: Credentials): RequestOptions => ({
    headers: { Authorization: `Bearer ${c.accessToken ?? ''}`, 'Content-Type': 'application/json' },
})

/**
 * POST https://api.hubapi.com/crm/v3/objects/{deals|contacts}/search with limit=1;
 * the response `total` is the number of matching records.
 */
async function count(c: Credentials, object: 'deals' | 'contacts', filters: Array<Record<string, string>>): Promise<number> {
    const res = await requestJson<{ total?: number }>('HubSpot', `${BASE}/crm/v3/objects/${object}/search`, {
        ...opts(c),
        method: 'POST',
        body: JSON.stringify({ filterGroups: [{ filters }], limit: 1, properties: ['hs_object_id'] }),
    })
    return res.total ?? 0
}

/**
 * Same search endpoint, returning up to 100 records (most recent first by `sortBy`)
 * with the requested properties. Used for medians; 100 is a sample, not a full scan.
 */
async function list(c: Credentials, object: 'deals' | 'contacts', filters: Array<Record<string, string>>, properties: string[], sortBy: string) {
    const res = await requestJson<{ results?: Array<{ properties?: Record<string, string | null> }> }>('HubSpot', `${BASE}/crm/v3/objects/${object}/search`, {
        ...opts(c),
        method: 'POST',
        body: JSON.stringify({ filterGroups: [{ filters }], limit: 100, properties, sorts: [{ propertyName: sortBy, direction: 'DESCENDING' }] }),
    })
    return (res.results ?? []).map(r => r.properties ?? {})
}

/** Days between two HubSpot timestamps (ISO strings or epoch ms); null if either is missing or out of order. */
export function daysBetween(from: string | null | undefined, to: string | null | undefined): number | null {
    if (!from || !to) return null
    const parse = (v: string) => (/^\d+$/.test(v) ? Number(v) : Date.parse(v))
    const a = parse(from), b = parse(to)
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null
    return (b - a) / 86_400_000
}

export function median(values: number[]): number | null {
    if (values.length === 0) return null
    const v = [...values].sort((x, y) => x - y)
    const mid = Math.floor(v.length / 2)
    return Math.round((v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2) * 10) / 10
}

const range = (property: string, from: Date, to: Date) => [
    { propertyName: property, operator: 'GTE', value: String(from.getTime()) },
    { propertyName: property, operator: 'LT', value: String(to.getTime()) },
]

/** GET /crm/v3/objects/contacts?limit=1 and /crm/v3/objects/deals?limit=1 (scope check) */
export async function validate(c: Credentials): Promise<ValidationResult> {
    try {
        await requestJson('HubSpot', `${BASE}/crm/v3/objects/contacts?limit=1`, { ...opts(c), retries: 1 })
        await requestJson('HubSpot', `${BASE}/crm/v3/objects/deals?limit=1`, { ...opts(c), retries: 1 })
        return { ok: true }
    } catch (error) {
        return {
            ok: false,
            error: `${describeError(error)}. The private app needs crm.objects.contacts.read and crm.objects.deals.read.`,
        }
    }
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const now = new Date()
    const d30 = daysAgo(30, now.getTime())
    const d60 = daysAgo(60, now.getTime())
    const won = [{ propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true' }]

    const wonLast30 = await count(c, 'deals', [...won, ...range('closedate', d30, now)])
    const wonPrev30 = await count(c, 'deals', [...won, ...range('closedate', d60, d30)])
    const contactsLast30 = await count(c, 'contacts', range('createdate', d30, now))

    return {
        growth: {
            newCustomersPerMonth: wonLast30,
            pipelineGrowth: pctChange(wonLast30, wonPrev30),
            newLeadsPerMonth: contactsLast30,
        },
        sales: await salesFunnel(c, now),
    }
}

/**
 * The funnel behind the Go-to-Market Score. Any part that fails (e.g. a portal without
 * a property) is left null rather than failing the whole HubSpot sync.
 */
async function salesFunnel(c: Credentials, now: Date) {
    const t = now.getTime()
    const d30 = daysAgo(30, t), d60 = daysAgo(60, t), d90 = daysAgo(90, t), d120 = daysAgo(120, t)
    const won = { propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'true' }
    const lost = [{ propertyName: 'hs_is_closed', operator: 'EQ', value: 'true' }, { propertyName: 'hs_is_closed_won', operator: 'EQ', value: 'false' }]
    const safe = async <T>(fn: () => Promise<T>): Promise<T | null> => {
        try { return await fn() } catch (error) {
            console.warn('HubSpot funnel signal skipped:', describeError(error))
            return null
        }
    }

    const wonDeals90d = await safe(() => count(c, 'deals', [won, ...range('closedate', d90, now)]))
    const lostDeals90d = await safe(() => count(c, 'deals', [...lost, ...range('closedate', d90, now)]))
    const expansionDeals90d = await safe(() => count(c, 'deals', [won, { propertyName: 'dealtype', operator: 'EQ', value: 'existingbusiness' }, ...range('closedate', d90, now)]))
    const dealsCreatedLast30 = await safe(() => count(c, 'deals', range('createdate', d30, now)))
    const dealsCreatedPrev30 = await safe(() => count(c, 'deals', range('createdate', d60, d30)))
    const leadCohort = await safe(() => count(c, 'contacts', range('createdate', d120, d30)))
    const leadCohortCustomers = await safe(() => count(c, 'contacts', [{ propertyName: 'lifecyclestage', operator: 'EQ', value: 'customer' }, ...range('createdate', d120, d30)]))

    const wonList = await safe(() => list(c, 'deals', [won, ...range('closedate', d90, now)], ['createdate', 'closedate'], 'closedate'))
    const closeDays = (wonList ?? []).map(p => daysBetween(p.createdate, p.closedate)).filter((d): d is number => d !== null)

    const customers = await safe(() => list(c, 'contacts', range('hs_lifecyclestage_customer_date', d90, now), ['createdate', 'hs_lifecyclestage_customer_date'], 'hs_lifecyclestage_customer_date'))
    const leadDays = (customers ?? []).map(p => daysBetween(p.createdate, p.hs_lifecyclestage_customer_date)).filter((d): d is number => d !== null)

    return {
        wonDeals90d, lostDeals90d, expansionDeals90d,
        medianDaysToClose: median(closeDays), daysToCloseSample: closeDays.length,
        dealsCreatedLast30, dealsCreatedPrev30,
        leadCohort, leadCohortCustomers,
        medianDaysLeadToCustomer: median(leadDays), leadToCustomerSample: leadDays.length,
    }
}
