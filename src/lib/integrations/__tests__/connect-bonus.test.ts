/**
 * Partner connect bonus. Run: npx tsx src/lib/integrations/__tests__/connect-bonus.test.ts
 */
import assert from 'node:assert/strict'
import { applyConnectBonus } from '../../plans'

function fake(sub: Record<string, unknown> | null) {
    const calls = { meta: 0, update: [] as Array<Record<string, unknown>> }
    const admin = {
        from: () => {
            const c: Record<string, unknown> = {
                select: () => c, eq: () => c,
                maybeSingle: async () => ({ data: sub }),
                update: (u: Record<string, unknown>) => { calls.update.push(u); return { eq: () => ({ eq: async () => ({ error: null }) }) } },
            }
            return c
        },
        auth: { admin: { updateUserById: async () => { calls.meta++; return { error: null } } } },
    }
    return { admin: admin as never, calls }
}

async function main() {
    const future = new Date(Date.now() + 10 * 86_400_000).toISOString()
    let f = fake({ status: 'trialing', trial_ends_at: future })
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'hubspot' } }, 'hubspot'), true)
    const newEnd = Date.parse(f.calls.update[0].trial_ends_at as string)
    assert.equal(Math.round((newEnd - Date.parse(future)) / 86_400_000), 30)
    assert.equal(f.calls.meta, 1)

    f = fake({ status: 'trialing', trial_ends_at: future })
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'hubspot', connect_bonus_applied: 'x' } }, 'hubspot'), false, 'once only')
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'hubspot' } }, 'stripe'), false, 'other tool')
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'vestbee' } }, 'hubspot'), false, 'other perk')
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: {} }, 'hubspot'), false, 'no perk')
    f = fake({ status: 'active', trial_ends_at: future })
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'hubspot' } }, 'hubspot'), false, 'not trialing')
    f = fake({ status: 'trialing', trial_ends_at: new Date(Date.now() - 1000).toISOString() })
    assert.equal(await applyConnectBonus(f.admin, { id: 'u', user_metadata: { perk_code: 'hubspot' } }, 'hubspot'), false, 'trial over')
    console.log('7 passed')
}
main().catch(e => { console.error(e); process.exit(1) })
