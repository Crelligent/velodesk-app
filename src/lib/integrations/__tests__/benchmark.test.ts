/**
 * Programme benchmark aggregates. Plain node:assert, no framework.
 * Run: npx tsx src/lib/integrations/__tests__/benchmark.test.ts
 */
import assert from 'node:assert/strict'
import { benchmarkScores, latestPerUser, quantile, MIN_BENCHMARK_COMPANIES } from '../../benchmark'

let passed = 0
function test(name: string, fn: () => void) { fn(); passed++; console.log(`ok - ${name}`) }

test('quantile interpolates', () => {
    assert.equal(quantile([10, 20, 30, 40, 50], 0.5), 30)
    assert.equal(quantile([10, 20, 30, 40], 0.5), 25)
    assert.equal(quantile([10, 20, 30, 40, 50], 0.25), 20)
})

test('below the minimum: no distribution, no position', () => {
    const b = benchmarkScores([40, 60, 70, 80], 60)
    assert.equal(MIN_BENCHMARK_COMPANIES, 5)
    assert.equal(b.distribution, null)
    assert.equal(b.companies, 4)
    assert.equal(b.aheadOf, null)
})

test('five companies: median, quartiles and your position', () => {
    const b = benchmarkScores([40, 52, 61, 69, 80], 69)
    assert.deepEqual(b.distribution, { companies: 5, median: 61, p25: 52, p75: 69 })
    // 3 of the 4 others are below 69
    assert.equal(b.aheadOf, 75)
})

test('ties count half; lowest and highest', () => {
    assert.equal(benchmarkScores([50, 50, 60, 70, 80], 50).aheadOf, 13) // (0 + 0.5) / 4
    assert.equal(benchmarkScores([10, 20, 30, 40, 50], 50).aheadOf, 100)
    assert.equal(benchmarkScores([10, 20, 30, 40, 50], 10).aheadOf, 0)
})

test('member without a score still sees the distribution', () => {
    const b = benchmarkScores([40, 52, 61, 69, 80], null)
    assert.ok(b.distribution)
    assert.equal(b.aheadOf, null)
})

test('latestPerUser keeps the newest row per company', () => {
    const m = latestPerUser([{ user_id: 'a', score: 70 }, { user_id: 'b', score: '55.4' }, { user_id: 'a', score: 40 }])
    assert.equal(m.get('a'), 70)
    assert.equal(m.get('b'), 55)
})

console.log(`\n${passed} passed`)
