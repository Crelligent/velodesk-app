/**
 * Paystack (customer's own account): revenue + churn. Billing source.
 * Credentials: { secretKey } (legacy rows store the raw key; see registry.parseCredentials)
 */
import { requestJson, ProviderError, describeError, daysAgo, type RequestOptions } from './http'
import { addTo, headlineCurrency, roundMap } from './money'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'billing' as const

export interface PaystackMetrics {
    mrr: number; // in major units (naira) of `currency`
    activeSubscriptions: number;
    totalRevenue: number; // successful transactions, major units of `currency`
    churnRate: number | null; // % of subscriptions cancelled in the last 30 days
    churnBase: number; // active + cancelled in the last 30 days
    currency: string; // NGN when the account has NGN activity
    mrrByCurrency: Record<string, number>;
    revenueByCurrency: Record<string, number>;
    recordsProcessed: number;
    truncated: boolean; // true if MAX_PAGES was hit
}

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PER_PAGE = 100;
const MAX_PAGES = 200; // safety cap: 20k records per resource

// Monthly multiplier per Paystack plan interval
const MONTHLY_FACTOR: Record<string, number> = {
    hourly: 730,
    daily: 30.44,
    weekly: 4.345,
    monthly: 1,
    quarterly: 1 / 3,
    biannually: 1 / 6,
    annually: 1 / 12,
};

interface PaystackPage<T> {
    status: boolean;
    message: string;
    data: T[];
    meta?: { page?: number; pageCount?: number };
}

const auth = (apiKey: string): RequestOptions => ({ headers: { Authorization: `Bearer ${apiKey}` } });

async function fetchAllPages<T>(path: string, apiKey: string): Promise<{ items: T[]; truncated: boolean }> {
    const items: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        const sep = path.includes('?') ? '&' : '?';
        const body = await requestJson<PaystackPage<T>>(
            'Paystack', `${PAYSTACK_BASE_URL}${path}${sep}perPage=${PER_PAGE}&page=${page}`, auth(apiKey));
        if (!body.status) throw new ProviderError('Paystack', 200, 'Paystack API returned an error');
        const data = body.data || [];
        items.push(...data);
        const pageCount = body.meta?.pageCount;
        if (data.length < PER_PAGE || (pageCount !== undefined && page >= pageCount)) {
            return { items, truncated: false };
        }
    }
    return { items, truncated: true };
}

/**
 * GET https://api.paystack.co/subscription (List Subscriptions, paginated perPage/page)
 * GET https://api.paystack.co/transaction?status=success (List Transactions)
 * Amounts are in the subunit (kobo for NGN) and are divided by 100.
 */
export async function getPaystackMetrics(apiKey: string): Promise<PaystackMetrics | null> {
    try {
        const [subs, txs] = await Promise.all([
            fetchAllPages<any>('/subscription', apiKey),
            fetchAllPages<any>('/transaction?status=success', apiKey),
        ]);

        const mrrByCurrency: Record<string, number> = {};
        let activeSubscriptions = 0;
        let churnedLast30d = 0;
        const cutoff = daysAgo(30).getTime();

        for (const sub of subs.items) {
            if (sub.status === 'active') {
                activeSubscriptions++;
                const amount = (sub.amount ?? sub.plan?.amount ?? 0) / 100;
                const factor = MONTHLY_FACTOR[sub.plan?.interval] ?? 1;
                addTo(mrrByCurrency, sub.plan?.currency || 'NGN', amount * factor);
            } else if (sub.status === 'non-renewing' || sub.status === 'cancelled' || sub.status === 'complete') {
                // cancelledAt when present; updatedAt otherwise (approximation)
                const at = Date.parse(sub.cancelledAt ?? sub.updatedAt ?? '');
                if (!Number.isNaN(at) && at >= cutoff) churnedLast30d++;
            }
        }

        // Churn over the last 30 days: churned / (active now + churned in the window)
        const base = activeSubscriptions + churnedLast30d;
        const churnRate = base > 0 ? Math.round((churnedLast30d / base) * 1000) / 10 : null;

        const revenueByCurrency: Record<string, number> = {};
        for (const tx of txs.items) {
            if (tx.status === 'success') addTo(revenueByCurrency, tx.currency || 'NGN', tx.amount / 100);
        }

        const currency = headlineCurrency({ ...revenueByCurrency, ...mrrByCurrency }, 'NGN');

        return {
            mrr: Math.round((mrrByCurrency[currency] || 0) * 100) / 100,
            activeSubscriptions,
            totalRevenue: Math.round((revenueByCurrency[currency] || 0) * 100) / 100,
            churnRate,
            churnBase: base,
            currency,
            mrrByCurrency: roundMap(mrrByCurrency),
            revenueByCurrency: roundMap(revenueByCurrency),
            recordsProcessed: subs.items.length + txs.items.length,
            truncated: subs.truncated || txs.truncated,
        };
    } catch (error) {
        console.error('Failed to fetch Paystack metrics:', describeError(error));
        return null;
    }
}

/** GET https://api.paystack.co/transaction?perPage=1 (cheap authenticated call) */
export async function validatePaystackKey(apiKey: string): Promise<boolean> {
    if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(apiKey)) return false;
    try {
        await requestJson('Paystack', `${PAYSTACK_BASE_URL}/transaction?perPage=1`, { ...auth(apiKey), retries: 1 });
        return true;
    } catch {
        return false;
    }
}

export async function validate(c: Credentials): Promise<ValidationResult> {
    return (await validatePaystackKey(c.secretKey ?? ''))
        ? { ok: true }
        : { ok: false, error: 'Paystack rejected this secret key (it should start with sk_live_ or sk_test_)' };
}

export async function sync(c: Credentials): Promise<SignalSet> {
    const m = await getPaystackMetrics(c.secretKey ?? '');
    if (!m) throw new ProviderError('Paystack', 0, 'Paystack sync failed');
    return {
        revenue: {
            mrr: m.mrr,
            currency: m.currency,
            // a connected account with no active subscriptions has a real MRR of 0
            mrrByCurrency: Object.keys(m.mrrByCurrency).length ? m.mrrByCurrency : { [m.currency]: 0 },
            churnRate: m.churnRate,
            subscriptions: m.churnBase,
            expansionMrr: null, // Paystack has no plan-change history to measure expansion
        },
        notes: m.truncated ? ['Paystack: record cap reached; figures may be partial'] : undefined,
    };
}
