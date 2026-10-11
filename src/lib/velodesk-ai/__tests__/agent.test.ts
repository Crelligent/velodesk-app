/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Velodesk AI agent tests. Plain node:assert, fake Anthropic client, fake Supabase client.
 * Run: npx tsx src/lib/velodesk-ai/__tests__/agent.test.ts
 */
import assert from 'node:assert/strict'
import { runVelodeskAgent } from '../agent'
import { runTool } from '../tools'

// ---------------------------------------------------------------------------
// Fake Supabase: records filters, returns canned rows per table
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>
function fakeSupabase(tables: Record<string, Row[]>, log: string[] = []) {
  return {
    from(table: string) {
      const filters: Array<[string, unknown]> = []
      let lim = Infinity
      const q = {
        select(cols: string) { log.push(`${table}:select:${cols}`); return q },
        eq(col: string, val: unknown) { filters.push([col, val]); return q },
        order() { return q },
        limit(n: number) { lim = n; return q },
        rows() { return (tables[table] ?? []).filter((r) => filters.every(([c, v]) => r[c] === v)).slice(0, lim) },
        maybeSingle() { const r = q.rows(); return Promise.resolve({ data: r[0] ?? null, error: null }) },
        then(res: (v: { data: Row[]; error: null }) => unknown) { return Promise.resolve({ data: q.rows(), error: null }).then(res) },
      }
      return q
    },
  } as never
}

const USER = 'user-1'
const tables = {
  pmf_scores: [
    {
      user_id: USER, score: 68.4, calculated_at: '2026-10-10T08:00:00Z',
      breakdown: {
        retention: { score: 74, source: 'mixpanel', selfReported: false },
        revenueGrowth: { score: 71, source: 'paystack', selfReported: false },
        nps: { score: 62, source: 'self_reported', selfReported: true },
        referral: { score: null, source: null },
      },
      inputs: { basis: 'mixed', revenue: { mrr: 5000000, currency: 'NGN', bySource: [{ source: 'paystack', currency: 'NGN', mrr: 5000000 }] }, sourceErrors: { intercom: 'secret details' } },
    },
    { user_id: 'someone-else', score: 99, calculated_at: '2026-10-11T08:00:00Z', breakdown: {}, inputs: {} },
  ],
  integration_tokens: [
    { user_id: USER, provider: 'paystack', status: 'connected', created_at: '2026-09-01', updated_at: '2026-10-10' },
    { user_id: USER, provider: 'mixpanel', status: 'connected', created_at: '2026-09-02', updated_at: '2026-10-10' },
  ],
  experiments: [],
}

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  await fn()
  passed++
  console.log('  ok', name)
}

// ---------------------------------------------------------------------------
// Fake Anthropic client: scripted responses, records each request
// ---------------------------------------------------------------------------
function fakeClaude(script: Array<Record<string, unknown>>) {
  const requests: Array<Record<string, unknown>> = []
  return {
    requests,
    client: {
      messages: {
        create: async (req: Record<string, unknown>) => {
          requests.push(JSON.parse(JSON.stringify(req)))
          const next = script.shift()
          if (!next) throw new Error('script exhausted')
          return { usage: { input_tokens: 100, output_tokens: 20 }, ...next }
        },
      },
    } as never,
  }
}

async function main() {
  console.log('velodesk-ai')

  await test('get_current_score returns only this user\'s latest score, names sources, hides error details', async () => {
    const out = await runTool(fakeSupabase(tables), USER, 'get_current_score', {})
    const d = out.data as Record<string, any>
    assert.equal(d.score, 68)
    assert.equal(d.band, 'Emerging PMF')
    assert.equal(d.signalsUsed, 3)
    const referral = d.signals.find((s: any) => s.signal === 'Referral')
    assert.equal(referral.score, null)
    assert.match(referral.status, /no data/)
    const nps = d.signals.find((s: any) => s.signal.startsWith('Customer'))
    assert.equal(nps.selfReported, true)
    assert.deepEqual(d.toolsThatFailedLastSync, ['Intercom'])
    assert.ok(!JSON.stringify(d).includes('secret details'))
    assert.equal(d.revenue.bySource[0].source, 'Paystack')
    assert.deepEqual(out.sources.sort(), ['Mixpanel', 'Paystack', 'Self-reported'])
  })

  await test('list_data_sources never selects credential columns', async () => {
    const log: string[] = []
    const out = await runTool(fakeSupabase(tables, log), USER, 'list_data_sources', {})
    const sel = log.find((l) => l.startsWith('integration_tokens'))!
    assert.ok(!/token|config|secret|key/i.test(sel.replace('integration_tokens', '')), sel)
    const d = out.data as Record<string, any>
    assert.equal(d.connected.length, 2)
    assert.ok(d.availableButNotConnected.some((t: any) => t.tool === 'Intercom'))
  })

  await test('no score yet is reported plainly, not invented', async () => {
    const out = await runTool(fakeSupabase({ pmf_scores: [] }), USER, 'get_current_score', {})
    assert.equal((out.data as any).hasScore, false)
  })

  await test('agent runs tools, then answers with steps and sources', async () => {
    const { client, requests } = fakeClaude([
      { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't1', name: 'get_current_score', input: {} }] },
      { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Your score is **68** (Emerging PMF).' }] },
    ])
    const reply = await runVelodeskAgent({
      supabase: fakeSupabase(tables), userId: USER, companyName: 'Acme',
      messages: [{ role: 'user', content: 'What is my score?' }], client, model: 'test-model',
    })
    assert.equal(reply.text, 'Your score is **68** (Emerging PMF).')
    assert.deepEqual(reply.steps, [{ tool: 'get_current_score', label: 'Checked your current PMF Score', ok: true }])
    assert.ok(reply.sources.includes('Current PMF Score') && reply.sources.includes('Paystack'))
    assert.deepEqual(reply.usage, { inputTokens: 200, outputTokens: 40 })
    // second request carries the tool result back to Claude
    const second = requests[1] as any
    const toolResult = second.messages[2].content[0]
    assert.equal(toolResult.type, 'tool_result')
    assert.equal(toolResult.tool_use_id, 't1')
    assert.match(toolResult.content, /"score":68/)
    assert.match(second.system, /Acme/)
    assert.equal(second.model, 'test-model')
  })

  await test('a failing tool is reported to Claude as an error, not crashed on', async () => {
    const { client, requests } = fakeClaude([
      { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't1', name: 'nope', input: {} }] },
      { stop_reason: 'end_turn', content: [{ type: 'text', text: 'I could not check that.' }] },
    ])
    const reply = await runVelodeskAgent({ supabase: fakeSupabase(tables), userId: USER, messages: [{ role: 'user', content: 'x' }], client })
    assert.equal(reply.steps[0].ok, false)
    assert.equal((requests[1] as any).messages[2].content[0].is_error, true)
  })

  await test('tool rounds are capped and the last round forces a written answer', async () => {
    const loop = { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 't', name: 'get_scoring_method', input: {} }] }
    const { client, requests } = fakeClaude([loop, loop, loop, loop, loop, loop, { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Done.' }] }])
    const reply = await runVelodeskAgent({ supabase: fakeSupabase(tables), userId: USER, messages: [{ role: 'user', content: 'x' }], client })
    assert.equal(reply.text, 'Done.')
    assert.equal(requests.length, 7)
    assert.deepEqual((requests[6] as any).tool_choice, { type: 'none' })
    assert.equal((requests[0] as any).tool_choice, undefined)
  })

  console.log(`${passed} passed`)
}

main().catch((e) => { console.error(e); process.exit(1) })
