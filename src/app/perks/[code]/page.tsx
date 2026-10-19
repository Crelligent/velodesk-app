import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, Gauge, PlugZap, LineChart } from 'lucide-react'
import { getPerk, PERK_TRIAL_DAYS } from '@/lib/perks'

// Partner perk landing page: /perks/<code> (e.g. /perks/posthog).
// The CTA goes through /api/perks/claim, which remembers the code and opens sign-up.

// Providers whose data Velodesk reads directly (src/lib/integrations/registry.ts).
const CONNECTOR_PARTNERS = new Set(['posthog', 'mixpanel', 'paystack', 'hubspot'])

const CONNECTORS: { group: string; tools: string }[] = [
    { group: 'Payments', tools: 'Stripe, Paystack, Chargebee, Paddle' },
    { group: 'Product analytics', tools: 'Mixpanel, Amplitude, PostHog' },
    { group: 'CRM', tools: 'HubSpot, Pipedrive, Close' },
    { group: 'Support and feedback', tools: 'Intercom, Zendesk, Typeform' },
]

const STEPS = [
    { icon: PlugZap, title: 'Connect your tools', body: 'Link your payments, analytics, CRM and support tools in a few clicks.' },
    { icon: Gauge, title: 'Get your PMF Score', body: 'Velodesk scores retention, revenue, growth and satisfaction from your real data.' },
    { icon: LineChart, title: 'See what to fix', body: 'Track the score as you ship, and share an investor-ready view when you raise.' },
]

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const perk = getPerk((await params).code)
    if (!perk) return { title: 'Velodesk' }
    return {
        title: `${PERK_TRIAL_DAYS}-day Velodesk trial for ${perk.partner} founders`,
        description: `Measure product-market fit from your real data. ${PERK_TRIAL_DAYS} days free for ${perk.partner} founders, no credit card required.`,
        robots: { index: false },
    }
}

export default async function PerkPage({ params }: Props) {
    const perk = getPerk((await params).code)
    if (!perk) notFound()

    const claimHref = `/api/perks/claim?code=${perk.code}`
    const connectsDirectly = CONNECTOR_PARTNERS.has(perk.code)

    return (
        <main className="min-h-screen bg-bg text-text">
            <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
                <Link href="/" className="font-display text-lg text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
                    Velodesk
                </Link>
                <Link href="/login" className="text-sm text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
                    Sign in
                </Link>
            </header>

            <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 md:pt-16">
                <p className="text-xs uppercase tracking-wide text-text-muted">{perk.partner} founder offer</p>
                <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
                    Know whether you have product-market fit, from your own data.
                </h1>
                <p className="mt-6 max-w-prose text-lg text-text-muted">
                    Velodesk connects to the tools you already use and turns them into one PMF Score: retention,
                    revenue, growth and customer satisfaction, with the gaps to fix.
                    {connectsDirectly && ` It reads your ${perk.partner} data directly.`}
                </p>

                <div className="mt-10 rounded-xl border border-border bg-surface p-6 md:p-8">
                    <p className="font-display text-2xl">{PERK_TRIAL_DAYS} days free</p>
                    <ul className="mt-4 space-y-2 text-text-muted">
                        {[
                            `${PERK_TRIAL_DAYS}-day free trial instead of the usual 14 days`,
                            'No credit card required',
                            'Then from $15 a month (₦30,000 in Nigeria). Cancel any time.',
                        ].map(item => (
                            <li key={item} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <Link
                        href={claimHref}
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-medium text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    >
                        Claim your {PERK_TRIAL_DAYS}-day trial
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <p className="mt-3 text-sm text-text-muted">For new Velodesk accounts. Existing trials are not extended.</p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 pb-16">
                <h2 className="font-display text-2xl">How it works</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {STEPS.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="rounded-lg border border-border bg-surface p-5">
                            <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                            <h3 className="mt-3 font-medium">{title}</h3>
                            <p className="mt-2 text-sm text-text-muted">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 pb-24">
                <h2 className="font-display text-2xl">Works with your stack</h2>
                <dl className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
                    {CONNECTORS.map(({ group, tools }) => (
                        <div key={group} className="flex flex-col gap-1 px-5 py-4 md:flex-row md:gap-6">
                            <dt className="w-48 flex-none text-sm text-text-muted">{group}</dt>
                            <dd className="text-sm">{tools}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </main>
    )
}
