/**
 * Typeform: NPS from a 0-10 question the founder picks. Survey source.
 * Credentials: { token, formId, fieldId } (personal token with forms:read + responses:read)
 */
import { daysAgo, describeError, requestJson, type RequestOptions } from './http'
import type { Credentials, SignalSet, ValidationResult } from './signals'

export const kind = 'survey' as const

const BASE = 'https://api.typeform.com'
const PAGE = 1000
const MAX_PAGES = 10

interface FormField {
    id: string
    title?: string
    type?: string
    properties?: { steps?: number; start_at_one?: boolean; fields?: FormField[] }
}

const opts = (c: Credentials): RequestOptions => ({ headers: { Authorization: `Bearer ${c.token ?? ''}` } })

function flatten(fields: FormField[] = []): FormField[] {
    return fields.flatMap(f => [f, ...flatten(f.properties?.fields)])
}

/** NPS questions, or opinion scales that run 0-10 (11 steps, not starting at one) */
export function npsCapable(f: FormField): boolean {
    if (f.type === 'nps') return true
    return f.type === 'opinion_scale' && f.properties?.steps === 11 && !f.properties?.start_at_one
}

/** NPS = % promoters (9-10) - % detractors (0-6) */
export function npsFromScores(scores: number[]): number | null {
    if (scores.length === 0) return null
    const promoters = scores.filter(s => s >= 9).length
    const detractors = scores.filter(s => s <= 6).length
    return Math.round(((promoters - detractors) / scores.length) * 1000) / 10
}

/** GET https://api.typeform.com/forms/{form_id} (checks the chosen NPS field) */
export async function validate(c: Credentials): Promise<ValidationResult> {
    if (!/^[A-Za-z0-9]+$/.test(c.formId ?? '')) {
        return { ok: false, error: 'Typeform form ID is the part after /to/ in your form link', input: true }
    }
    try {
        const form = await requestJson<{ fields?: FormField[] }>('Typeform', `${BASE}/forms/${c.formId}`, { ...opts(c), retries: 1 })
        const candidates = flatten(form.fields).filter(npsCapable)
        if (candidates.some(f => f.id === c.fieldId)) return { ok: true }
        if (candidates.length === 0) {
            return { ok: false, error: 'This form has no 0-10 NPS or opinion-scale question', input: true }
        }
        const list = candidates.slice(0, 5).map(f => `${f.id} ("${(f.title ?? '').slice(0, 60)}")`).join(', ')
        return { ok: false, error: `Choose the NPS question ID. Options: ${list}`, input: true }
    } catch (error) {
        return { ok: false, error: describeError(error) }
    }
}

/**
 * GET https://api.typeform.com/forms/{form_id}/responses?page_size=1000&since&completed=true
 * (newest first; paginated with `before` = last response token). Last 90 days.
 */
export async function sync(c: Credentials): Promise<SignalSet> {
    const scores: number[] = []
    let before: string | undefined
    for (let page = 0; page < MAX_PAGES; page++) {
        const params = new URLSearchParams({
            page_size: String(PAGE),
            since: daysAgo(90).toISOString(),
            completed: 'true',
            ...(before ? { before } : {}),
        })
        const res = await requestJson<{ items?: Array<{ token?: string; answers?: Array<{ field?: { id?: string }; type?: string; number?: number }> }> }>(
            'Typeform', `${BASE}/forms/${encodeURIComponent(c.formId ?? '')}/responses?${params}`, opts(c))
        const items = res.items ?? []
        for (const item of items) {
            const answer = item.answers?.find(a => a.field?.id === c.fieldId && a.type === 'number')
            if (typeof answer?.number === 'number' && answer.number >= 0 && answer.number <= 10) scores.push(answer.number)
        }
        before = items[items.length - 1]?.token
        if (items.length < PAGE || !before) break
    }
    return { satisfaction: { nps: npsFromScores(scores), csat: null, responses: scores.length } }
}
