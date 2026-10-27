import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Database, Eye, Lock, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PERKS } from '@/lib/perks'
import { fromRow, safeReturnPath } from '@/lib/privacy'
import { PrivacyChoicesForm } from '@/components/privacy/PrivacyChoicesForm'

export const metadata = { title: 'Your data, your control | Velodesk' }

const ALWAYS = [
    { icon: Database, text: 'Your account details, and read-only access to the tools you connect, used only to calculate your scores. Raw customer records are read, never stored; only totals are kept.' },
    { icon: Lock, text: 'Held in the EU, encrypted, and never sold.' },
    { icon: Eye, text: 'Investors see nothing unless you share with them in Investor Access, and you can stop sharing at any time.' },
]

export default async function WelcomePrivacyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const next = safeReturnPath((await searchParams).next)

    const [{ data: row }, { data: member }] = await Promise.all([
        supabase.from('privacy_choices').select('benchmark, product_emails, usage_analytics').eq('user_id', user.id).maybeSingle(),
        supabase.from('programme_members').select('programme').eq('user_id', user.id).maybeSingle(),
    ])
    const programmeName = member?.programme ? (PERKS[member.programme]?.partner ?? null) : null

    return (
        <main data-clarity-mask="True" className="min-h-screen bg-bg flex items-start sm:items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl flex flex-col gap-8">
                <div>
                    <ShieldCheck size={28} className="text-accent mb-5" aria-hidden="true" />
                    <h1 className="text-3xl font-display font-light text-text mb-2">Your data, your control</h1>
                    <p className="text-sm text-text-muted">Velodesk respects your privacy. Here&apos;s what we need, and what&apos;s up to you.</p>
                </div>

                <section aria-labelledby="always-heading" className="p-5 bg-surface border border-border rounded-lg">
                    <h2 id="always-heading" className="text-xs uppercase tracking-wide text-text-muted mb-4">What Velodesk needs to work</h2>
                    <ul className="flex flex-col gap-3">
                        {ALWAYS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex gap-3 text-sm text-text">
                                <Icon size={16} className="text-text-muted shrink-0 mt-0.5" aria-hidden="true" />{text}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-text-muted mt-4">
                        <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                        {' · '}
                        <Link href="/terms" className="text-accent hover:underline">Terms</Link>
                    </p>
                </section>

                <section aria-labelledby="choices-heading">
                    <h2 id="choices-heading" className="text-xs uppercase tracking-wide text-text-muted mb-3">Your choices (all off until you turn them on)</h2>
                    <PrivacyChoicesForm initial={fromRow(row)} programmeName={programmeName} mode="welcome" next={next} />
                </section>
            </div>
        </main>
    )
}
