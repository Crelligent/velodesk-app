import assert from 'node:assert/strict'
import { freshAccessToken, needsRefresh, HUBSPOT_SCOPES } from '../oauth-tokens'

let passed = 0
const test = async (name: string, fn: () => Promise<void> | void) => { await fn(); passed++; console.log(`ok - ${name}`) }

function fakeAdmin() {
    const updates: Record<string, unknown>[] = []
    const chain = { eq: () => chain }
    const admin = { from: () => ({ update: (v: Record<string, unknown>) => { updates.push(v); return chain } }) }
    return { admin: admin as never, updates }
}
const soon = () => new Date(Date.now() + 60_000).toISOString()
const later = () => new Date(Date.now() + 3_600_000).toISOString()

async function main() {
    await test('scopes match what Velodesk reads', () => {
        assert.deepEqual(HUBSPOT_SCOPES, ['oauth', 'crm.objects.contacts.read', 'crm.objects.deals.read'])
    })
    await test('pasted tokens (no refresh token) are never refreshed', () => {
        assert.equal(needsRefresh({ provider: 'hubspot', access_token: 'pat', refresh_token: null, expires_at: null }), false)
    })
    await test('a token expiring within five minutes is refreshed', () => {
        assert.equal(needsRefresh({ provider: 'hubspot', access_token: 'a', refresh_token: 'r', expires_at: soon() }), true)
        assert.equal(needsRefresh({ provider: 'hubspot', access_token: 'a', refresh_token: 'r', expires_at: later() }), false)
    })
    await test('refresh saves the new token and returns it', async () => {
        const { admin, updates } = fakeAdmin()
        const fetchImpl = (async () => new Response(JSON.stringify({ access_token: 'new', refresh_token: 'r2', expires_in: 1800 }), { status: 200 })) as typeof fetch
        const token = await freshAccessToken(admin, 'u', { provider: 'hubspot', access_token: 'old', refresh_token: 'r', expires_at: soon() }, fetchImpl)
        assert.equal(token, 'new')
        assert.equal(updates[0].access_token, 'new')
        assert.equal(updates[0].refresh_token, 'r2')
        assert.equal(updates[0].status, 'connected')
    })
    await test('a failed refresh marks the connection expired and returns nothing', async () => {
        const { admin, updates } = fakeAdmin()
        const fetchImpl = (async () => new Response('{}', { status: 400 })) as typeof fetch
        const token = await freshAccessToken(admin, 'u', { provider: 'hubspot', access_token: 'old', refresh_token: 'r', expires_at: soon() }, fetchImpl)
        assert.equal(token, null)
        assert.equal(updates[0].status, 'expired')
    })
    await test('an unexpired token is used as is', async () => {
        const { admin, updates } = fakeAdmin()
        const token = await freshAccessToken(admin, 'u', { provider: 'hubspot', access_token: 'ok', refresh_token: 'r', expires_at: later() })
        assert.equal(token, 'ok')
        assert.equal(updates.length, 0)
    })
    console.log(`\n${passed} tests passed`)
}
main()
