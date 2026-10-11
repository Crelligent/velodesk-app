/** Mirrors the weights in src/lib/pmf-score.ts. Keep in sync if the scoring model changes. */
export const SIGNALS = [
  { key: 'retention', label: 'Retention', weight: 25 },
  { key: 'revenueGrowth', label: 'Revenue growth', weight: 20 },
  { key: 'nps', label: 'Customer satisfaction', weight: 15 },
  { key: 'engagement', label: 'Engagement', weight: 15 },
  { key: 'timeToValue', label: 'Time to value', weight: 10 },
  { key: 'expansion', label: 'Expansion', weight: 10 },
  { key: 'referral', label: 'Referrals', weight: 5 },
] as const

/** Score bands, same thresholds as getPMFStage in src/lib/pmf-score.ts. */
export const BANDS = [
  { min: 0, max: 39, label: 'Pre-PMF', color: '#64748B' },
  { min: 40, max: 59, label: 'Searching', color: '#5B8DEF' },
  { min: 60, max: 79, label: 'Emerging', color: '#7B61FF' },
  { min: 80, max: 100, label: 'Strong PMF', color: '#38BDF8' },
] as const

export function bandFor(score: number) {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0]
}
