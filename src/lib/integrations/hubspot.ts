/**
 * HubSpot: deals won + contacts created per month (growth signal). CRM source.
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
    }
}
