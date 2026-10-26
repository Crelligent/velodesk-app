/**
 * Go-to-Market Score + CRM PMF fallbacks. Plain node:assert, no framework.
 * Run: npx tsx src/lib/integrations/__tests__/gtm.test.ts
 */
import assert from 'node:assert/strict'
import { deriveGtm, GTM_MIN_COMPONENTS } from '../../gtm-score'
import { deriveMetrics, type SignalSet, type SourcedSignalSet } from '../signals'
import { daysBetween, median } from '../hubspot'

let passed = 0
function test(name: string, fn: () => void) {
    fn()
    passed++
    console.log(`ok - ${name}`)
}

const sales = (over: Partial<NonNullable<SignalSet['sales']>> = {}): NonNullable<SignalSet['sales']> => ({
    wonDeals90d: 15, lostDeals90d: 35, // 30% win rate
    medianDaysToClose: 30, daysToCloseSample: 15,
    dealsCreatedLast30: 22, dealsCreatedPrev30: 20, // +10%
    leadCohort: 400, leadCohortCustomers: 20, // 5%
    expansionDeals90d: 3, // 20% of won
    medianDaysLeadToCustomer: 60, leadToCustomerSample: 12,
    ...over,
})
const crm = (s: NonNullable<SignalSet['sales']>, provider = 'hubspot'): SourcedSignalSet => ({ provider, kind: 'crm', signals: { sales: s } })

test('no CRM -> no GTM score, nothing invented', () => {
    const g = deriveGtm([])
    assert.equal(g.score, null)
    assert.deepEqual(g.inputsUsed, [])
})

test('full funnel scores every component', () => {
    const g = deriveGtm([crm(sales())])
    assert.equal(g.components.winRate.value, 30)
    assert.equal(g.components.winRate.score, 80)
    assert.equal(g.components.dealSpeed.score, 80)
    assert.equal(g.components.pipelineGrowth.score, 60)
    assert.equal(g.components.leadConversion.score, 75)
    // 0.3*80 + 0.25*60 + 0.25*75 + 0.2*80 = 73.75
    assert.equal(g.score, 74)
    assert.equal(g.components.winRate.source, 'hubspot')
})

test('small samples are excluded, not defaulted', () => {
    const g = deriveGtm([crm(sales({ wonDeals90d: 2, lostDeals90d: 3, daysToCloseSample: 2, leadCohort: 10 }))])
    assert.equal(g.components.winRate.score, null)
    assert.equal(g.components.dealSpeed.score, null)
    assert.equal(g.components.leadConversion.score, null)
    assert.ok(g.ignored.hubspot.includes('win rate'))
    // only pipeline growth left -> below the minimum, no score
    assert.equal(g.inputsUsed.length, 1)
    assert.ok(GTM_MIN_COMPONENTS > 1)
    assert.equal(g.score, null)
})

test('weights renormalise over available components', () => {
    const g = deriveGtm([crm(sales({ leadCohort: null, leadCohortCustomers: null, medianDaysToClose: null }))])
    // win rate 80 (0.3) + pipeline 60 (0.25) -> (24 + 15) / 0.55 = 70.9
    assert.equal(g.score, 71)
})

test('no previous-month deals -> pipeline growth excluded', () => {
    const g = deriveGtm([crm(sales({ dealsCreatedLast30: 12, dealsCreatedPrev30: 0 }))])
    assert.equal(g.components.pipelineGrowth.score, null)
})

test('CRM expansion fallback only when billing has none', () => {
    const d = deriveMetrics([crm(sales())])
    assert.equal(d.metrics.expansion, 60)
    assert.equal(d.sources.expansion, 'hubspot')
    const withBilling = deriveMetrics([
        { provider: 'stripe', kind: 'billing', signals: { revenue: { mrr: 1000, currency: 'USD', mrrByCurrency: { USD: 1000 }, churnRate: null, expansionMrr: 50, subscriptions: 50 } } },
        crm(sales()),
    ])
    assert.equal(withBilling.sources.expansion, 'stripe')
})

test('lead-to-customer time feeds time to value, with a minimum sample', () => {
    assert.equal(deriveMetrics([crm(sales())]).metrics.timeToValue, 60)
    const thin = deriveMetrics([crm(sales({ leadToCustomerSample: 3 }))])
    assert.equal(thin.metrics.timeToValue, undefined)
    assert.ok(thin.ignored.hubspot.includes('new customers'))
})

test('daysBetween + median helpers', () => {
    assert.equal(daysBetween('2026-01-01T00:00:00Z', '2026-01-11T00:00:00Z'), 10)
    assert.equal(daysBetween(String(Date.UTC(2026, 0, 1)), String(Date.UTC(2026, 0, 3))), 2)
    assert.equal(daysBetween('2026-01-11T00:00:00Z', '2026-01-01T00:00:00Z'), null)
    assert.equal(daysBetween(null, '2026-01-01'), null)
    assert.equal(median([5, 1, 3]), 3)
    assert.equal(median([1, 2, 3, 4]), 2.5)
    assert.equal(median([]), null)
})

console.log(`\n${passed} passed`)
