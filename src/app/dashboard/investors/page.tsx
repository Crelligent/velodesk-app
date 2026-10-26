import { ShieldCheck, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAILS } from '@/lib/demo'
import { ShareForm } from './ShareForm'
import { revokeInvestor } from './actions'

export const metadata = { title: 'Investor access | Velodesk' }

export default async function InvestorAccessPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isDemo = DEMO_EMAILS.has((user?.email || '').toLowerCase())

    const { data: rows, error } = user
        ? await supabase
            .from('investor_access')
            .select('id, investor_email, created_at')
            .eq('founder_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
        : { data: [], error: null }

    return (
        <div className="max-w-3xl mx-auto pb-24 flex flex-col gap-8">
            <header>
                <h1 className="text-2xl font-display font-light text-text mb-2">Investor access</h1>
                <p className="text-sm text-text-muted max-w-prose">
                    Share your PMF Score and Go-to-Market Score with the investors and accelerators you choose. They see your scores and how they change over time, calculated from your connected data. You can remove access at any time.
                </p>
            </header>

            <section aria-labelledby="share-heading" className="p-5 bg-surface border border-border rounded-lg">
                <h2 id="share-heading" className="text-xs uppercase tracking-wide text-text-muted mb-4">Share with an investor</h2>
                {isDemo && (
                    <p className="text-sm text-text-muted mb-4">This is a demo account, so sharing is turned off.</p>
                )}
                <ShareForm disabled={isDemo} />
            </section>

            <section aria-labelledby="list-heading" className="p-5 bg-surface border border-border rounded-lg">
                <h2 id="list-heading" className="text-xs uppercase tracking-wide text-text-muted mb-4">Who can see your scores</h2>
                {error ? (
                    <p className="text-sm text-text-muted">We couldn&apos;t load this list just now. Refresh the page to try again.</p>
                ) : !rows || rows.length === 0 ? (
                    <div className="flex items-center gap-3 text-sm text-text-muted">
                        <ShieldCheck size={16} aria-hidden="true" />
                        No one yet. Investors you share with will appear here.
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {rows.map(r => (
                            <li key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                                <div>
                                    <div className="text-sm text-text break-all">{r.investor_email}</div>
                                    <div className="text-xs text-text-muted">
                                        Shared {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <form action={revokeInvestor}>
                                    <input type="hidden" name="id" value={r.id} />
                                    <button
                                        type="submit"
                                        aria-label={`Remove access for ${r.investor_email}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-border-strong text-sm text-text rounded-md hover:bg-surface-2 transition"
                                    >
                                        <UserX size={14} aria-hidden="true" /> Remove access
                                    </button>
                                </form>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
