import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAILS } from '@/lib/demo'
import { DEAL_PROPERTIES, INVESTOR_HUBSPOT_PROVIDER, type SyncSummary } from '@/lib/hubspot-investor'
import { ConnectForm, SyncButton } from './Forms'
import { disconnectHubSpot } from './actions'

export const metadata = { title: 'HubSpot deal scoring | Velodesk' }

const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default async function InvestorHubSpotPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isDemo = DEMO_EMAILS.has((user?.email || '').toLowerCase())

    // RLS: investors read their own integration row (token column is never selected here)
    const { data: row } = user
        ? await supabase.from('integration_tokens').select('status, config, last_sync_at')
            .eq('user_id', user.id).eq('provider', INVESTOR_HUBSPOT_PROVIDER).maybeSingle()
        : { data: null }
    const last = (row?.config as { lastSync?: SyncSummary } | null)?.lastSync ?? null

    return (
        <div className="max-w-3xl flex flex-col gap-8">
            <header>
                <h1 className="font-display text-3xl font-extralight text-text mb-2">HubSpot deal scoring</h1>
                <p className="text-sm text-text-muted max-w-prose">
                    If you track deals in HubSpot, Velodesk writes each shared company&apos;s PMF Score and Go-to-Market Score onto its deals, so you can sort, filter and build reports on them. Only companies that have shared their scores with you are included, and scores refresh daily.
                </p>
            </header>

            {isDemo && (
                <p className="flex items-start gap-2 p-4 bg-surface border border-border rounded-lg text-sm text-text-muted">
                    <Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                    This is a demo account, so connecting HubSpot is turned off. With a real account, the four Velodesk properties below appear on your deals in a &ldquo;Velodesk&rdquo; group.
                </p>
            )}

            {!row ? (
                <section aria-labelledby="connect-heading" className="p-5 bg-surface border border-border rounded-lg flex flex-col gap-4">
                    <h2 id="connect-heading" className="text-xs uppercase tracking-wide text-text-muted">Connect your HubSpot</h2>
                    <ConnectForm disabled={isDemo} />
                </section>
            ) : (
                <section aria-labelledby="status-heading" className="p-5 bg-surface border border-border rounded-lg flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 id="status-heading" className="flex items-center gap-2 text-sm text-text">
                            {row.status === 'error'
                                ? <><AlertCircle size={16} className="text-danger" aria-hidden="true" /> HubSpot needs attention</>
                                : <><CheckCircle2 size={16} className="text-accent" aria-hidden="true" /> HubSpot connected</>}
                        </h2>
                        <div className="flex gap-2">
                            <SyncButton />
                            <form action={disconnectHubSpot}>
                                <button type="submit" className="px-4 py-2 border border-border-strong text-sm text-text rounded-md hover:bg-surface-2 transition">Disconnect</button>
                            </form>
                        </div>
                    </div>
                    {!last ? (
                        <p className="text-sm text-text-muted">No sync has run yet. Select &ldquo;Sync now&rdquo;.</p>
                    ) : last.error ? (
                        <p className="flex items-center gap-2 text-sm text-danger"><AlertCircle size={14} aria-hidden="true" />{last.error}</p>
                    ) : (
                        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div><dt className="text-xs text-text-muted">Last sync</dt><dd className="text-text">{fmt(last.at)}</dd></div>
                            <div><dt className="text-xs text-text-muted">Companies sharing</dt><dd className="tabular-nums text-text">{last.shared}</dd></div>
                            <div><dt className="text-xs text-text-muted">Matched in HubSpot</dt><dd className="tabular-nums text-text">{last.matched}</dd></div>
                            <div><dt className="text-xs text-text-muted">Deals updated</dt><dd className="tabular-nums text-text">{last.dealsUpdated}</dd></div>
                        </dl>
                    )}
                    {last && !last.error && last.shared === 0 && (
                        <p className="text-sm text-text-muted">No companies have shared their scores with you yet. Their deals update as soon as they do.</p>
                    )}
                    {last && last.unmatched.length > 0 && (
                        <div className="text-sm text-text-muted">
                            <p className="mb-1">Not found in your HubSpot. Add a company record with the same website domain or exact name, linked to the deal:</p>
                            <ul className="list-disc pl-5">{last.unmatched.map(n => <li key={n}>{n}</li>)}</ul>
                        </div>
                    )}
                </section>
            )}

            <section aria-labelledby="props-heading" className="p-5 bg-surface border border-border rounded-lg">
                <h2 id="props-heading" className="text-xs uppercase tracking-wide text-text-muted mb-3">Deal properties Velodesk adds</h2>
                <ul className="divide-y divide-border">
                    {DEAL_PROPERTIES.map(p => (
                        <li key={p.name} className="py-2 first:pt-0 last:pb-0">
                            <div className="text-sm text-text">{p.label}</div>
                            <div className="text-xs text-text-muted">{p.description}</div>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-text-muted mt-3">
                    Deals are matched through their associated company: by website domain first, then by exact company name.
                </p>
            </section>
        </div>
    )
}
