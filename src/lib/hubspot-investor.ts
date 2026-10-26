/**
 * Investor deal scoring in HubSpot (wow feature 2).
 *
 * An investor who tracks deals in HubSpot connects a private app token. Velodesk then
 * writes the PMF Score and Go-to-Market Score of every company that has SHARED its
 * scores with that investor (investor_access) onto the matching deals, as deal
 * properties the investor can sort, filter and report on.
 *
 * Matching: the deal's associated company, found by website domain first, then by
 * exact company name. Nothing is written for companies that have not shared.
 *
 * Token scopes: crm.objects.deals.read, crm.objects.deals.write,
 * crm.objects.companies.read, crm.schemas.deals.read, crm.schemas.deals.write.
 * Server only.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { describeError, ProviderError, requestJson, type RequestOptions } from './integrations/http'

export const INVESTOR_HUBSPOT_PROVIDER = 'hubspot_investor'
const BASE = 'https://api.hubapi.com'
const GROUP = 'velodesk'

export const DEAL_PROPERTIES = [
    { name: 'velodesk_pmf_score', label: 'Velodesk PMF Score', type: 'number', fieldType: 'number', description: 'Product-market fit, 0-100, from the company\'s connected data. Shared by the founder.' },
    { name: 'velodesk_gtm_score', label: 'Velodesk Go-to-Market Score', type: 'number', fieldType: 'number', description: 'Is the selling working, 0-100, from the company\'s CRM. Shared by the founder.' },
    { name: 'velodesk_pmf_change', label: 'Velodesk PMF change', type: 'number', fieldType: 'number', description: 'Change in the PMF Score since the previous score.' },
    { name: 'velodesk_scores_updated', label: 'Velodesk scores updated', type: 'datetime', fieldType: 'date', description: 'When Velodesk last calculated these scores.' },
] as const

const opts = (token: string): RequestOptions => ({
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
})

/** Founder email domain, unless it's a free mail provider (then it says nothing about the company). */
const FREE_MAIL = new Set(['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'ymail.com', 'gmx.com', 'zoho.com', 'mail.com'])
export function companyDomainFromEmail(email: string | null | undefined): string | null {
    const domain = (email ?? '').toLowerCase().split('@')[1]?.trim()
    if (!domain || !domain.includes('.') || FREE_MAIL.has(domain)) return null
    return domain
}

export type ValidateResult = { ok: true } | { ok: false; error: string }

/** Read + schema checks; write access is confirmed on the first sync. */
export async function validateInvestorToken(token: string): Promise<ValidateResult> {
    try {
        await requestJson('HubSpot', `${BASE}/crm/v3/objects/deals?limit=1`, { ...opts(token), retries: 1 })
        await requestJson('HubSpot', `${BASE}/crm/v3/objects/companies?limit=1`, { ...opts(token), retries: 1 })
        await requestJson('HubSpot', `${BASE}/crm/v3/properties/deals/groups`, { ...opts(token), retries: 1 })
        return { ok: true }
    } catch (error) {
        const auth = error instanceof ProviderError && (error.status === 401 || error.status === 403)
        return {
            ok: false,
            error: auth
                ? 'HubSpot refused this token. The private app needs: crm.objects.deals.read and .write, crm.objects.companies.read, crm.schemas.deals.read and .write.'
                : 'Couldn\'t reach HubSpot with this token. Check it and try again.',
        }
    }
}

async function ensureDealProperties(token: string): Promise<void> {
    const existing = await requestJson<{ results?: Array<{ name: string }> }>('HubSpot', `${BASE}/crm/v3/properties/deals`, opts(token))
    const names = new Set((existing.results ?? []).map(p => p.name))
    if (DEAL_PROPERTIES.every(p => names.has(p.name))) return

    const groups = await requestJson<{ results?: Array<{ name: string }> }>('HubSpot', `${BASE}/crm/v3/properties/deals/groups`, opts(token))
    if (!(groups.results ?? []).some(g => g.name === GROUP)) {
        await requestJson('HubSpot', `${BASE}/crm/v3/properties/deals/groups`, {
            ...opts(token), method: 'POST', body: JSON.stringify({ name: GROUP, label: 'Velodesk', displayOrder: -1 }),
        })
    }
    for (const p of DEAL_PROPERTIES) {
        if (names.has(p.name)) continue
        await requestJson('HubSpot', `${BASE}/crm/v3/properties/deals`, {
            ...opts(token), method: 'POST', body: JSON.stringify({ ...p, groupName: GROUP }),
        })
    }
}

async function findCompanyIds(token: string, domain: string | null, name: string | null): Promise<string[]> {
    const search = async (propertyName: string, value: string) => {
        const res = await requestJson<{ results?: Array<{ id: string }> }>('HubSpot', `${BASE}/crm/v3/objects/companies/search`, {
            ...opts(token), method: 'POST',
            body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName, operator: 'EQ', value }] }], limit: 10, properties: ['name'] }),
        })
        return (res.results ?? []).map(r => r.id)
    }
    if (domain) {
        const byDomain = await search('domain', domain)
        if (byDomain.length) return byDomain
    }
    if (name && name.trim().length >= 2) return search('name', name.trim())
    return []
}

async function dealIdsForCompany(token: string, companyId: string): Promise<string[]> {
    const res = await requestJson<{ results?: Array<{ toObjectId: number | string }> }>(
        'HubSpot', `${BASE}/crm/v4/objects/companies/${encodeURIComponent(companyId)}/associations/deals?limit=100`, opts(token))
    return (res.results ?? []).map(r => String(r.toObjectId))
}

export interface SyncSummary {
    at: string
    shared: number
    matched: number
    dealsUpdated: number
    unmatched: string[]
    error?: string
}

interface Latest { score: number; prev: number | null; at: string }
function latestByUser(rows: Array<{ user_id: string; score: number | string; calculated_at: string }>): Map<string, Latest> {
    const out = new Map<string, Latest>()
    for (const r of rows) {
        const cur = out.get(r.user_id)
        if (!cur) out.set(r.user_id, { score: Math.round(Number(r.score)), prev: null, at: r.calculated_at })
        else if (cur.prev === null) cur.prev = Math.round(Number(r.score))
    }
    return out
}

/**
 * Writes shared scores onto the investor's HubSpot deals and records the summary in
 * integration_tokens.config. `admin` is the service-role client; `investorId` must come
 * from the session or the cron's own query.
 */
export async function syncInvestorHubSpot(admin: SupabaseClient, investorId: string): Promise<SyncSummary> {
    const at = new Date().toISOString()
    const save = async (summary: SyncSummary, status: 'connected' | 'error' = 'connected') => {
        await admin.from('integration_tokens')
            .update({ config: { lastSync: summary }, last_sync_at: at, status, updated_at: at })
            .eq('user_id', investorId).eq('provider', INVESTOR_HUBSPOT_PROVIDER)
        return summary
    }

    const { data: tokenRow } = await admin.from('integration_tokens')
        .select('access_token').eq('user_id', investorId).eq('provider', INVESTOR_HUBSPOT_PROVIDER).maybeSingle()
    let token = ''
    try { token = JSON.parse(tokenRow?.access_token ?? '{}').accessToken ?? '' } catch { /* invalid row */ }
    if (!token) return { at, shared: 0, matched: 0, dealsUpdated: 0, unmatched: [], error: 'HubSpot is not connected.' }

    const { data: account } = await admin.auth.admin.getUserById(investorId)
    const email = (account?.user?.email ?? '').toLowerCase()
    const { data: access } = await admin.from('investor_access')
        .select('founder_id, company_name, company_domain')
        .eq('investor_email', email).eq('status', 'active')
    const shared = access ?? []
    if (shared.length === 0) return save({ at, shared: 0, matched: 0, dealsUpdated: 0, unmatched: [] })

    const ids = shared.map(a => a.founder_id as string)
    const [{ data: pmfRows }, { data: gtmRows }] = await Promise.all([
        admin.from('pmf_scores').select('user_id, score, calculated_at').in('user_id', ids).order('calculated_at', { ascending: false }).limit(2000),
        admin.from('gtm_scores').select('user_id, score, calculated_at').in('user_id', ids).order('calculated_at', { ascending: false }).limit(2000),
    ])
    const pmf = latestByUser((pmfRows ?? []) as never[])
    const gtm = latestByUser((gtmRows ?? []) as never[])

    try {
        await ensureDealProperties(token)
        const updates: Array<{ id: string; properties: Record<string, string> }> = []
        const unmatched: string[] = []
        let matched = 0
        for (const a of shared) {
            const p = pmf.get(a.founder_id), g = gtm.get(a.founder_id)
            if (!p && !g) continue
            const companies = await findCompanyIds(token, a.company_domain, a.company_name)
            const deals = new Set<string>()
            for (const c of companies) for (const d of await dealIdsForCompany(token, c)) deals.add(d)
            if (deals.size === 0) { unmatched.push(a.company_name || a.company_domain || 'Unnamed company'); continue }
            matched++
            const latestAt = [p?.at, g?.at].filter(Boolean).sort().pop()!
            const properties: Record<string, string> = { velodesk_scores_updated: String(Date.parse(latestAt)) }
            if (p) {
                properties.velodesk_pmf_score = String(p.score)
                if (p.prev !== null) properties.velodesk_pmf_change = String(p.score - p.prev)
            }
            if (g) properties.velodesk_gtm_score = String(g.score)
            for (const id of deals) updates.push({ id, properties })
        }
        for (let i = 0; i < updates.length; i += 100) {
            await requestJson('HubSpot', `${BASE}/crm/v3/objects/deals/batch/update`, {
                ...opts(token), method: 'POST', body: JSON.stringify({ inputs: updates.slice(i, i + 100) }),
            })
        }
        return save({ at, shared: shared.length, matched, dealsUpdated: updates.length, unmatched })
    } catch (error) {
        const auth = error instanceof ProviderError && (error.status === 401 || error.status === 403)
        console.error(`Investor HubSpot sync failed for ${investorId}:`, describeError(error))
        return save({
            at, shared: shared.length, matched: 0, dealsUpdated: 0, unmatched: [],
            error: auth
                ? 'HubSpot refused the update. Check the private app still has the deal write and schema write scopes.'
                : 'The sync didn\'t finish. It will try again tomorrow, or you can run it now.',
        }, auth ? 'error' : 'connected')
    }
}

/** Daily: every investor with HubSpot connected. Never throws. */
export async function syncAllInvestorHubSpot(admin: SupabaseClient): Promise<number> {
    const { data } = await admin.from('integration_tokens').select('user_id')
        .eq('provider', INVESTOR_HUBSPOT_PROVIDER).eq('status', 'connected')
    const ids = (data ?? []).map(r => r.user_id as string)
    for (const id of ids) {
        try { await syncInvestorHubSpot(admin, id) } catch (e) { console.error('Investor sync error:', describeError(e)) }
    }
    return ids.length
}
