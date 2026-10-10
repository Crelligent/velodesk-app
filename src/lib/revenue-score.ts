/**
 * Currency-aware MRR scoring for the PMF Score.
 *
 * - Single-currency founders are scored on that currency's own bands (no FX).
 * - Founders with MRR in several currencies (e.g. Stripe USD + Paystack NGN)
 *   have everything converted to REPORTING_CURRENCY and scored on its bands.
 */

export const REPORTING_CURRENCY = 'USD'

/**
 * NGN per 1 USD, used ONLY to combine multi-currency MRR.
 * Set USD_NGN_RATE in the environment. The default of 1500 is an approximate
 * placeholder, not a live rate. Update it when the market moves.
 */
export const DEFAULT_USD_NGN_RATE = 1500

export function usdNgnRate(): number {
    const fromEnv = Number(process.env.USD_NGN_RATE)
    return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_USD_NGN_RATE
}

/**
 * Optional extra rates for billing tools that charge in other currencies
 * (Chargebee/Paddle often bill in EUR/GBP). Set FX_UNITS_PER_USD to JSON,
 * e.g. {"EUR":0.92,"GBP":0.79}. Currencies without a rate are excluded, never guessed.
 */
function extraRates(): Record<string, number> {
    try {
        const parsed = JSON.parse(process.env.FX_UNITS_PER_USD || '{}') as Record<string, unknown>
        return Object.fromEntries(
            Object.entries(parsed).filter((e): e is [string, number] => typeof e[1] === 'number' && e[1] > 0)
                .map(([k, v]) => [k.toUpperCase(), v])
        )
    } catch {
        return {}
    }
}

/** Units of `currency` per 1 USD. Only currencies with a known rate can be scored. */
function unitsPerUsd(currency: string): number | null {
    switch (currency) {
        case 'USD': return 1
        case 'NGN': return usdNgnRate()
        default: return extraRates()[currency] ?? null
    }
}

/**
 * MRR bands: [mrr in major units, score 0-100], linearly interpolated, capped at 100.
 * USD keeps the previous behaviour (linear, $5,000 MRR = 100).
 * NGN is defined explicitly so product can tune it for local purchasing power.
 * It currently mirrors USD at ₦1,500/$ (₦7.5M MRR = 100).
 */
export const MRR_BANDS: Record<string, Array<[number, number]>> = {
    USD: [[0, 0], [1_000, 20], [2_500, 50], [5_000, 100]],
    NGN: [[0, 0], [1_500_000, 20], [3_750_000, 50], [7_500_000, 100]],
}

export function interpolate(bands: Array<[number, number]>, value: number): number {
    if (value <= bands[0][0]) return bands[0][1]
    for (let i = 1; i < bands.length; i++) {
        const [x1, y1] = bands[i]
        if (value <= x1) {
            const [x0, y0] = bands[i - 1]
            return y0 + ((value - x0) / (x1 - x0)) * (y1 - y0)
        }
    }
    return bands[bands.length - 1][1]
}

export interface RevenueSummary {
    mrr: number // in `currency`
    currency: string
    bySource: Array<{ source: string; currency: string; mrr: number }>
    fxRate?: { pair: 'USD/NGN'; rate: number } // present only when FX was applied
    otherFx?: Array<{ currency: string; unitsPerUsd: number }> // FX_UNITS_PER_USD rates applied
    excluded: Array<{ source: string; currency: string; mrr: number; reason: string }>
    score: number // 0-100
}

/**
 * Combines MRR from several sources (each with a per-currency map) and scores it.
 * Returns null if no source has MRR in a supported currency.
 */
export function scoreMrr(
    sources: Array<{ source: string; mrrByCurrency: Record<string, number> }>
): RevenueSummary | null {
    const bySource: RevenueSummary['bySource'] = []
    const excluded: RevenueSummary['excluded'] = []

    for (const { source, mrrByCurrency } of sources) {
        for (const [rawCurrency, mrr] of Object.entries(mrrByCurrency)) {
            const currency = rawCurrency.toUpperCase()
            if (unitsPerUsd(currency) === null) {
                excluded.push({ source, currency, mrr, reason: 'unsupported_currency' })
            } else {
                bySource.push({ source, currency, mrr })
            }
        }
    }
    // Sources are connected but none reported anything we can score
    if (bySource.length === 0) return null

    const currencies = new Set(bySource.map(s => s.currency))
    let currency: string
    let mrr: number
    let fxRate: RevenueSummary['fxRate']
    let fxApplied: RevenueSummary['otherFx']

    if (currencies.size === 1 && MRR_BANDS[bySource[0].currency]) {
        // Single currency with its own bands: no FX involved
        currency = bySource[0].currency
        mrr = bySource.reduce((sum, s) => sum + s.mrr, 0)
    } else {
        currency = REPORTING_CURRENCY
        mrr = bySource.reduce((sum, s) => sum + s.mrr / (unitsPerUsd(s.currency) as number), 0)
        if (currencies.has('NGN')) fxRate = { pair: 'USD/NGN', rate: usdNgnRate() }
        const others = [...currencies].filter(c => c !== 'USD' && c !== 'NGN')
        if (others.length) fxApplied = others.map(c => ({ currency: c, unitsPerUsd: unitsPerUsd(c) as number }))
    }

    const score = Math.round(Math.min(100, Math.max(0, interpolate(MRR_BANDS[currency], mrr))))
    return { mrr: Math.round(mrr * 100) / 100, currency, bySource, fxRate, otherFx: fxApplied, excluded, score }
}
