/**
 * Investor HubSpot deal sync against a mocked HubSpot API and a fake Supabase client.
 * Run: npx tsx src/lib/integrations/__tests__/hubspot-investor.test.ts
 */
import assert from 'node:assert/strict'
import { companyDomainFromEmail, syncInvestorHubSpot } from '../../hubspot-investor'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) { await fn(); passed++; console.log(`ok - ${name}`) }

// --- fake Supabase (only the calls the sync makes) ---
function fakeAdmin(tables: Record<string, Array<Record<string, unknown>>>, email: string) {
    const updates: Array<Record<string, unknown>> = []
    const q = (table: string) => {
        let rows = [...(tables[table] ?? [])]
        const chain: Record<string, unknown> = {
            select: () => chain,
            eq: (k: string, v: unknown) => { rows = rows.filter(r => r[k] === v); return chain },
            in: (k: string, vs: unknown[]) => { rows = rows.filter(r => vs.includes(r[k])); return chain },
            order: () => { rows.sort((a, b) => String(b.calculated_at).localeCompare(String(a.calculated_at))); return chain },
            limit: () => chain,
            maybeSingle: async () => ({ data: rows[0] ?? null }),
            update: (u: Record<string, unknown>) => { updates.push(u); return chain },
            then: (res: (v: unknown) => void) => res({ data: rows, error: null }),
        }
        return chain
    }
    return {
        admin: { from: q, auth: { admin: { getUserById: async () => ({ data: { user: { email } } }) } } } as never,
        updates,
    }
}

// --- mocked HubSpot ---
const calls: Array<{ method: string; path: string; body?: unknown }> = []
const realFetch = globalThis.fetch
function mockHubSpot() {
    calls.length = 0
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
        const path = new URL(url).pathname
        const method = init?.method ?? 'GET'
        const body = init?.body ? JSON.parse(String(init.body)) : undefined
        calls.push({ method, path, body })
        const json = (o: unknown) => new Response(JSON.stringify(o), { status: 200, headers: { 'Content-Type': 'application/json' } })
        if (path === '/crm/v3/properties/deals' && method === 'GET') return json({ results: [{ name: 'dealname' }] })
        if (path === '/crm/v3/properties/deals/groups' && method === 'GET') return json({ results: [] })
        if (path.startsWith('/crm/v3/properties/deals')) return json({})
        if (path === '/crm/v3/objects/companies/search') {
            const f = body.filterGroups[0].filters[0]
            if (f.propertyName === 'domain' && f.value === 'brightloop.io') return json({ results: [{ id: 'c1' }] })
            return json({ results: [] })
        }
        if (path === '/crm/v4/objects/companies/c1/associations/deals') return json({ results: [{ toObjectId: 101 }, { toObjectId: 102 }] })
        if (path === '/crm/v3/objects/deals/batch/update') return json({ status: 'COMPLETE' })
        return new Response('not found', { status: 404 })
    }) as typeof fetch
}

async function main() {
await test('company domain from work email only', () => {
    assert.equal(companyDomainFromEmail('ada@Brightloop.io'), 'brightloop.io')
    assert.equal(companyDomainFromEmail('ada@gmail.com'), null)
    assert.equal(companyDomainFromEmail('nope'), null)
})

await test('creates properties once, matches by domain, writes both scores to every deal', async () => {
    mockHubSpot()
    const { admin, updates } = fakeAdmin({
        integration_tokens: [{ user_id: 'inv', provider: 'hubspot_investor', access_token: JSON.stringify({ accessToken: 'pat-test' }) }],
        investor_access: [
            { investor_email: 'kd@fund.com', status: 'active', founder_id: 'f1', company_name: 'Brightloop', company_domain: 'brightloop.io' },
            { investor_email: 'kd@fund.com', status: 'active', founder_id: 'f2', company_name: 'Nowhere Ltd', company_domain: null },
            { investor_email: 'kd@fund.com', status: 'active', founder_id: 'f3', company_name: 'No Scores', company_domain: null },
        ],
        pmf_scores: [
            { user_id: 'f1', score: 69, calculated_at: '2026-10-26T05:00:00Z' },
            { user_id: 'f1', score: 61, calculated_at: '2026-10-25T05:00:00Z' },
            { user_id: 'f2', score: 40, calculated_at: '2026-10-26T05:00:00Z' },
        ],
        gtm_scores: [{ user_id: 'f1', score: 66, calculated_at: '2026-10-26T05:00:00Z' }],
    }, 'KD@fund.com'.toLowerCase())

    const s = await syncInvestorHubSpot(admin, 'inv')
    assert.equal(s.error, undefined)
    assert.equal(s.shared, 3)
    assert.equal(s.matched, 1)
    assert.equal(s.dealsUpdated, 2)
    assert.deepEqual(s.unmatched, ['Nowhere Ltd']) // f3 has no scores: skipped, not "unmatched"

    assert.equal(calls.filter(c => c.method === 'POST' && c.path === '/crm/v3/properties/deals/groups').length, 1)
    assert.equal(calls.filter(c => c.method === 'POST' && c.path === '/crm/v3/properties/deals').length, 4)
    const batch = calls.find(c => c.path === '/crm/v3/objects/deals/batch/update')!.body as { inputs: Array<{ id: string; properties: Record<string, string> }> }
    assert.deepEqual(batch.inputs.map(i => i.id), ['101', '102'])
    assert.equal(batch.inputs[0].properties.velodesk_pmf_score, '69')
    assert.equal(batch.inputs[0].properties.velodesk_pmf_change, '8')
    assert.equal(batch.inputs[0].properties.velodesk_gtm_score, '66')
    assert.equal(batch.inputs[0].properties.velodesk_scores_updated, String(Date.parse('2026-10-26T05:00:00Z')))
    assert.ok((updates[0].config as { lastSync: unknown }).lastSync)
})

await test('no token -> clear message, no HubSpot calls', async () => {
    mockHubSpot()
    const { admin } = fakeAdmin({ integration_tokens: [] }, 'x@fund.com')
    const s = await syncInvestorHubSpot(admin, 'inv')
    assert.equal(s.error, 'HubSpot is not connected.')
    assert.equal(calls.length, 0)
})

globalThis.fetch = realFetch
console.log(`\n${passed} passed`)
}
main().catch(e => { console.error(e); process.exit(1) })
