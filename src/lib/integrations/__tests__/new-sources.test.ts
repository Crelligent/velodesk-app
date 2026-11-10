/**
 * Flutterwave, Google Analytics, Search Console and the Search demand GTM component.
 * Run: npx tsx src/lib/integrations/__tests__/new-sources.test.ts
 */
import assert from 'node:assert/strict'
import { summarise, type FlwTransaction } from '../flutterwave'
import { engagementFrom, MIN_MAU } from '../google-analytics'
import { pickSite } from '../google-search-console'
import { deriveGtm } from '../../gtm-score'
import type { SourcedSignalSet } from '../signals'

let passed = 0
function test(name: string, fn: () => void) {
    fn()
    passed++
    console.log(`ok - ${name}`)
}

const NOW = Date.parse('2026-11-10T12:00:00Z')
const day = (n: number) => new Date(NOW - n * 86_400_000).toISOString()
const tx = (email: string, daysBack: number, amount = 10_000, status = 'successful'): FlwTransaction =>
    ({ amount, currency: 'NGN', status, created_at: day(daysBack), customer: { email } })

test('Flutterwave: subscriptions give MRR by plan interval', () => {
    const s = summarise(
        [{ id: 1, amount: 10_000, interval: 'monthly', currency: 'NGN' }, { id: 2, amount: 120_000, interval: 'yearly', currency: 'NGN' }],
        [{ id: 10, plan: 1, status: 'active' }, { id: 11, plan: 2, status: 'active' }, { id: 12, plan: 1, status: 'cancelled' }],
        [], NOW)
    assert.equal(s.mrrFrom, 'subscriptions')
    assert.equal(s.activeSubscriptions, 2)
    assert.equal(s.mrrByCurrency.NGN, 20_000) // 10k monthly + 120k/12
})

test('Flutterwave: no subscriptions -> last 30 days of successful payments', () => {
    const s = summarise([], [], [tx('a@x.com', 5), tx('b@x.com', 20, 5_000), tx('c@x.com', 40), tx('d@x.com', 3, 9_999, 'failed')], NOW)
    assert.equal(s.mrrFrom, 'payments')
    assert.equal(s.mrrByCurrency.NGN, 15_000)
})

test('Flutterwave: customer churn = paid 31-60 days ago, not since', () => {
    const s = summarise([], [], [
        tx('a@x.com', 45), tx('a@x.com', 10), // stayed
        tx('b@x.com', 50), // lost
        tx('C@X.com', 35), tx('c@x.com', 2), // stayed (email case ignored)
        tx('d@x.com', 40), // lost
    ], NOW)
    assert.equal(s.churnBase, 4)
    assert.equal(s.churnRate, 50)
})

test('Flutterwave: no prior customers -> churn unknown, not 0', () => {
    const s = summarise([], [], [tx('a@x.com', 5)], NOW)
    assert.equal(s.churnRate, null)
})

test('Google Analytics: DAU/MAU from 28 daily totals', () => {
    const e = engagementFrom(28 * 40, 150, 400) // 40 a day, 400 a month
    assert.equal(e.dau, 40)
    assert.equal(e.stickiness, 0.1)
})

test('Google Analytics: too few monthly users -> no engagement score', () => {
    const e = engagementFrom(28 * 2, 10, MIN_MAU - 1)
    assert.equal(e.stickiness, null)
    assert.equal(e.mau, null)
})

test('Search Console: verified domain property first, unverified skipped', () => {
    assert.equal(pickSite([
        { siteUrl: 'https://a.com/', permissionLevel: 'siteOwner' },
        { siteUrl: 'sc-domain:a.com', permissionLevel: 'siteFullUser' },
        { siteUrl: 'sc-domain:b.com', permissionLevel: 'siteUnverifiedUser' },
    ]), 'sc-domain:a.com')
    assert.equal(pickSite([]), null)
})

const search = (last: number, prev: number): SourcedSignalSet =>
    ({ provider: 'google-search-console', kind: 'marketing', signals: { demand: { searchClicksLast28: last, searchClicksPrev28: prev } } })

test('GTM: search demand scored from click growth', () => {
    const g = deriveGtm([search(120, 100)]) // +20%
    assert.equal(g.components.searchDemand.value, 20)
    assert.ok(g.components.searchDemand.score! > 60)
    assert.equal(g.score, null) // one component alone is not a GTM score
})

test('GTM: too few clicks -> search demand left out with a reason', () => {
    const g = deriveGtm([search(20, 10)])
    assert.equal(g.components.searchDemand.score, null)
    assert.match(g.ignored['google-search-console'], /need 50/)
})

console.log(`\n${passed} passed`)
