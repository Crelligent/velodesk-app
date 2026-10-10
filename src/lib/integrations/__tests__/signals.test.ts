/**
 * SignalSet merge + scoring tests. Plain node:assert, no framework.
 * Run: npx tsx src/lib/integrations/__tests__/signals.test.ts
 */
import assert from 'node:assert/strict'
import { deriveMetrics, type SourcedSignalSet } from '../signals'
import { npsFromScores, npsCapable } from '../typeform'
import { retentionAt } from '../mixpanel'
import { cellPct } from '../amplitude'
import { subscriptionMrr } from '../paddle'
import { postHogOrigin } from '../posthog'

let passed = 0
function test(name: string, fn: () => void) {
    fn()
    passed++
    console.log(`ok - ${name}`)
}

const billing = (provider: string, mrrByCurrency: Record<string, number>, churnRate: number | null = null, subscriptions = 50): SourcedSignalSet => ({
    provider, kind: 'billing',
    signals: { revenue: { mrr: null, currency: null, mrrByCurrency, churnRate, expansionMrr: null, subscriptions } },
})

test('no sources -> no metrics, nothing invented', () => {
    const d = deriveMetrics([])
    assert.deepEqual(d.metrics, {})
    assert.deepEqual(d.sources, {})
    assert.equal(d.revenue, null)
})

test('all-null SignalSets produce no metrics', () => {
    const d = deriveMetrics([
        { provider: 'mixpanel', kind: 'analytics', signals: { retention: { month1: null, month3: null, month6: null }, engagement: { dau: null, wau: null, mau: null, stickiness: null } } },
        { provider: 'intercom', kind: 'support', signals: { satisfaction: { nps: null, csat: null, responses: 0 } } },
    ])
    assert.deepEqual(d.metrics, {})
})

test('billing sources are combined for revenue (NGN + USD -> USD at env rate)', () => {
    process.env.USD_NGN_RATE = '1500'
    const d = deriveMetrics([billing('stripe', { USD: 1000 }), billing('paystack', { NGN: 2_250_000 })])
    assert.equal(d.revenue?.currency, 'USD')
    assert.equal(d.revenue?.mrr, 2500)
    assert.equal(d.metrics.revenueGrowth, 50)
    assert.equal(d.sources.revenueGrowth, 'stripe+paystack')
})

test('billing beats CRM for revenue', () => {
    const crm: SourcedSignalSet = { provider: 'hubspot', kind: 'crm', signals: { growth: { newCustomersPerMonth: 20, pipelineGrowth: 50, newLeadsPerMonth: 100 } } }
    const d = deriveMetrics([crm, billing('paystack', { NGN: 3_750_000 })])
    assert.equal(d.sources.revenueGrowth, 'paystack')
    assert.equal(d.metrics.revenueGrowth, 50)
})

test('CRM pipeline growth is used only when no billing source exists', () => {
    const d = deriveMetrics([{ provider: 'pipedrive', kind: 'crm', signals: { growth: { newCustomersPerMonth: 11, pipelineGrowth: 10, newLeadsPerMonth: null } } }])
    assert.equal(d.sources.revenueGrowth, 'pipedrive')
    assert.equal(d.metrics.revenueGrowth, 60)
})

test('analytics retention beats billing churn; churn is the fallback', () => {
    const analytics: SourcedSignalSet = { provider: 'amplitude', kind: 'analytics', signals: { retention: { month1: 42, month3: null, month6: null, cohortSize: 120 } } }
    const withBoth = deriveMetrics([billing('stripe', { USD: 100 }, 3), analytics])
    assert.equal(withBoth.metrics.retention, 42)
    assert.equal(withBoth.sources.retention, 'amplitude')

    const churnOnly = deriveMetrics([billing('stripe', { USD: 100 }, 3)])
    assert.equal(churnOnly.metrics.retention, 70) // 100 - 3% * 10
    assert.equal(churnOnly.sources.retention, 'stripe')
})

test('engagement: analytics stickiness beats CRM', () => {
    const d = deriveMetrics([
        { provider: 'hubspot', kind: 'crm', signals: { engagement: { dau: null, wau: null, mau: null, stickiness: 0.5 } } },
        { provider: 'posthog', kind: 'analytics', signals: { engagement: { dau: 200, wau: null, mau: 1000, stickiness: 0.2 } } },
    ])
    assert.equal(d.sources.engagement, 'posthog')
    assert.equal(d.metrics.engagement, 60)
})

test('satisfaction: survey NPS beats support CSAT; NPS maps -100..100 to 0..100', () => {
    const d = deriveMetrics([
        { provider: 'zendesk', kind: 'support', signals: { satisfaction: { nps: null, csat: 90, responses: 40 } } },
        { provider: 'typeform', kind: 'survey', signals: { satisfaction: { nps: 30, csat: null, responses: 50 } } },
    ])
    assert.equal(d.sources.nps, 'typeform')
    assert.equal(d.metrics.nps, 65)
    const csatOnly = deriveMetrics([{ provider: 'zendesk', kind: 'support', signals: { satisfaction: { nps: null, csat: 90, responses: 40 } } }])
    assert.equal(csatOnly.metrics.nps, 90)
})

test('feedback (Canny) demand never becomes a score', () => {
    const d = deriveMetrics([{ provider: 'canny', kind: 'feedback', signals: { demand: { postsLast30d: 50, votesLast30d: 900 } } }])
    assert.deepEqual(d.metrics, {})
})

test('unsupported currency is excluded, not guessed', () => {
    delete process.env.FX_UNITS_PER_USD
    const d = deriveMetrics([billing('chargebee', { EUR: 4000 })])
    assert.equal(d.revenue, null)
    assert.equal(d.metrics.revenueGrowth, undefined)
    process.env.FX_UNITS_PER_USD = '{"EUR":0.8}'
    const withRate = deriveMetrics([billing('chargebee', { EUR: 4000 })])
    assert.equal(withRate.revenue?.currency, 'USD')
    assert.equal(withRate.revenue?.mrr, 5000)
    assert.equal(withRate.metrics.revenueGrowth, 100)
    delete process.env.FX_UNITS_PER_USD
})

test('timeToValue and referral stay missing', () => {
    const d = deriveMetrics([billing('stripe', { USD: 5000 }, 1)])
    assert.equal(d.metrics.timeToValue, undefined)
    assert.equal(d.metrics.referral, undefined)
})

test('Typeform NPS math and question eligibility', () => {
    assert.equal(npsFromScores([]), null)
    assert.equal(npsFromScores([10, 9, 8, 7, 0]), 20) // 2 promoters, 1 detractor of 5
    assert.equal(npsCapable({ id: 'a', type: 'nps' }), true)
    assert.equal(npsCapable({ id: 'b', type: 'opinion_scale', properties: { steps: 11, start_at_one: false } }), true)
    assert.equal(npsCapable({ id: 'c', type: 'opinion_scale', properties: { steps: 5, start_at_one: true } }), false)
})

test('Mixpanel retention only counts cohorts whose interval has elapsed', () => {
    const now = new Date('2026-10-10T00:00:00Z')
    const data = {
        '2026-07-01': { counts: [100, 40, 30], first: 100 },
        '2026-08-01': { counts: [200, 60], first: 200 },
        '2026-09-01': { counts: [50, 10], first: 50 }, // month 1 (Oct) not complete yet
    }
    assert.equal(retentionAt(data, 1, now), 33.3) // (40 + 60) / (100 + 200)
    assert.equal(retentionAt(data, 6, now), null)
})

test('Amplitude retention cells: incomplete or empty -> null', () => {
    const cells = [{ count: 100, outof: 100 }, { count: 25, outof: 100 }, { count: 5, outof: 50, incomplete: true }]
    assert.equal(cellPct(cells, 1), 25)
    assert.equal(cellPct(cells, 2), null)
    assert.equal(cellPct(null, 1), null)
})

test('Paddle MRR normalises yearly and multi-quantity prices, skips one-time', () => {
    const into: Record<string, number> = {}
    subscriptionMrr({
        currency_code: 'USD',
        billing_cycle: { interval: 'year', frequency: 1 },
        items: [
            { quantity: 2, price: { unit_price: { amount: '12000', currency_code: 'USD' }, billing_cycle: { interval: 'year', frequency: 1 } } },
            { quantity: 1, price: { unit_price: { amount: '500', currency_code: 'USD' }, billing_cycle: null } },
        ],
    }, into)
    // 2 x $120/yr = $240/yr -> $20/month; the one-time item (billing_cycle: null) is excluded
    assert.equal(into.USD, 20)
})

test('minimum samples: small NPS / CSAT / billing / cohort signals are ignored with a reason', () => {
    const d = deriveMetrics([
        { provider: 'typeform', name: 'Typeform', kind: 'survey', signals: { satisfaction: { nps: 60, csat: null, responses: 12 } } },
        { provider: 'zendesk', name: 'Zendesk', kind: 'support', signals: { satisfaction: { nps: null, csat: 95, responses: 29 } } },
        { provider: 'posthog', name: 'PostHog', kind: 'analytics', signals: { retention: { month1: 80, month3: null, month6: null, cohortSize: 7 } } },
        { ...billing('paystack', { NGN: 1_000_000 }, 0, 6), name: 'Paystack' },
    ])
    assert.equal(d.metrics.nps, undefined)
    assert.equal(d.metrics.retention, undefined)
    assert.equal(d.ignored.typeform, 'Typeform: 12 responses, need 30')
    assert.equal(d.ignored.zendesk, 'Zendesk: 29 ratings, need 30')
    assert.equal(d.ignored.posthog, 'PostHog: 7 users in the month-1 cohort, need 20')
    assert.equal(d.ignored.paystack, 'Paystack: 6 subscriptions, need 10')
    // revenue itself is still scored (MRR is a fact, not a sample)
    assert.equal(d.sources.revenueGrowth, 'paystack')
})

test('a small survey falls through to support CSAT with enough ratings', () => {
    const d = deriveMetrics([
        { provider: 'typeform', kind: 'survey', signals: { satisfaction: { nps: 60, csat: null, responses: 12 } } },
        { provider: 'intercom', kind: 'support', signals: { satisfaction: { nps: null, csat: 80, responses: 120 } } },
    ])
    assert.equal(d.sources.nps, 'intercom')
    assert.deepEqual(d.selfReported, [])
})

test('survey NPS is labelled selfReported (founder-run survey)', () => {
    const d = deriveMetrics([{ provider: 'typeform', kind: 'survey', signals: { satisfaction: { nps: 20, csat: null, responses: 45 } } }])
    assert.equal(d.metrics.nps, 60)
    assert.deepEqual(d.selfReported, ['nps'])
})

test('PostHog host allow-list: cloud hosts over https on the default port only', () => {
    assert.equal(postHogOrigin(undefined), 'https://us.posthog.com')
    assert.equal(postHogOrigin('https://eu.posthog.com/'), 'https://eu.posthog.com')
    assert.equal(postHogOrigin('us.i.posthog.com'), 'https://us.i.posthog.com')
    for (const bad of ['http://us.posthog.com', 'https://us.posthog.com:8443', 'https://posthog.example.com',
        'https://169.254.169.254', 'https://us.posthog.com.evil.io', 'https://user:pw@eu.posthog.com']) {
        assert.throws(() => postHogOrigin(bad), bad)
    }
})

console.log(`\n${passed} tests passed`)
