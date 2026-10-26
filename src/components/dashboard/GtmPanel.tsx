import Link from 'next/link'
import { Target } from 'lucide-react'
import { GTM_COMPONENTS, GTM_LABELS, gtmScoreLabel, type GtmComponent } from '@/lib/gtm-score'

export interface GtmPanelData {
    score: number
    change: number | null
    calculatedAt: string | null
    components: Partial<Record<GtmComponent, { score: number | null; value: number | null; unit: string }>>
}

function formatValue(value: number | null, unit: string): string {
    if (value === null) return ''
    if (unit === 'days') return `${Math.round(value)} days`
    if (unit === '% change') return `${value > 0 ? '+' : ''}${value}%`
    return `${value}%`
}

/** Go-to-Market Score beside the PMF Score: is the selling working? */
export function GtmPanel({ data, sample }: { data: GtmPanelData | null; sample?: boolean }) {
    if (!data) {
        return (
            <section aria-labelledby="gtm-heading" className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 mb-4 bg-surface border border-border rounded-lg">
                <Target size={18} className="text-text-muted shrink-0" aria-hidden="true" />
                <div className="flex-1">
                    <h2 id="gtm-heading" className="text-xs uppercase tracking-wide text-text-muted mb-1">Go-to-Market Score</h2>
                    <p className="text-sm text-text-muted max-w-prose">
                        Connect HubSpot (or keep it syncing) to see whether your selling is working: win rate, deal speed, pipeline growth and lead-to-customer conversion. It appears once there are enough deals and leads to measure.
                    </p>
                </div>
                <Link href="/dashboard/integrations" className="shrink-0 inline-flex items-center justify-center px-4 py-2 border border-border-strong text-sm text-text rounded-md hover:bg-surface-2 transition">
                    Manage data sources
                </Link>
            </section>
        )
    }

    return (
        <section aria-labelledby="gtm-heading" className="flex flex-col md:flex-row gap-6 p-5 mb-4 bg-surface border border-border rounded-lg">
            <div className="flex flex-col items-center justify-center md:pr-8 md:border-r border-border min-w-[140px]">
                <h2 id="gtm-heading" className="text-xs uppercase tracking-wide text-text-muted mb-1">Go-to-Market Score</h2>
                <div className="text-4xl font-display font-light tabular-nums text-text">{Math.round(data.score)}</div>
                <div className="text-xs text-text mt-1">{gtmScoreLabel(data.score)}</div>
                {data.change !== null && data.change !== 0 && (
                    <div className={`text-xs mt-1 ${data.change > 0 ? 'text-accent' : 'text-warning'}`}>
                        {data.change > 0 ? '+' : ''}{data.change} since last score
                    </div>
                )}
                {sample ? (
                    <div className="text-xs text-text-muted mt-2 px-2 py-0.5 border border-border-strong rounded-md">Sample data</div>
                ) : data.calculatedAt && (
                    <div className="text-xs text-text-muted mt-2">
                        Updated {new Date(data.calculatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm text-text-muted mb-3">Is the selling working? From your CRM, last 90 days.</p>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {GTM_COMPONENTS.map(key => {
                        const c = data.components[key]
                        const score = c?.score ?? null
                        return (
                            <div key={key} className="flex items-center justify-between gap-3 text-xs">
                                <dt className="text-text-muted w-28">{GTM_LABELS[key]}</dt>
                                <dd className="flex items-center gap-3 flex-1">
                                    <div className="h-1.5 flex-1 bg-surface-2 rounded-full overflow-hidden" aria-hidden="true">
                                        {score !== null && <div className="h-full bg-accent rounded-full" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />}
                                    </div>
                                    <span className="text-text tabular-nums w-28 text-right">
                                        {score !== null ? <>{Math.round(score)} <span className="text-text-muted">· {formatValue(c!.value, c!.unit)}</span></> : <span className="text-text-muted">Not enough data</span>}
                                    </span>
                                </dd>
                            </div>
                        )
                    })}
                </dl>
            </div>
        </section>
    )
}
