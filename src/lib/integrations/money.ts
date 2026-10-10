/** Currency helpers shared by billing integrations. */

const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'])

/** Minor units (cents/kobo) -> major units */
export function toMajor(amountMinor: number, currency: string): number {
    return ZERO_DECIMAL.has(currency.toUpperCase()) ? amountMinor : amountMinor / 100
}

/** Months covered by one billing period of `frequency` x `interval` */
export function monthsPerPeriod(interval: string, frequency = 1): number | null {
    const perUnit: Record<string, number> = { day: 12 / 365, week: 12 / 52, month: 1, year: 12 }
    const m = perUnit[interval]
    return m === undefined ? null : m * Math.max(1, frequency)
}

export function addTo(map: Record<string, number>, currency: string, amount: number): void {
    const key = currency.toUpperCase()
    map[key] = (map[key] || 0) + amount
}

export function roundMap(map: Record<string, number>): Record<string, number> {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, Math.round(v * 100) / 100]))
}

/** Headline currency: NGN if present (Nigerian founders), else the largest. */
export function headlineCurrency(map: Record<string, number>, fallback: string): string {
    if ('NGN' in map) return 'NGN'
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0]
    return top?.[0] ?? fallback
}
