import Link from 'next/link'
import { ArrowLeft, CheckCircle2, CreditCard, Download, FileText, AlertTriangle } from 'lucide-react'
import { accessUntilAfterFailure, formatDate, formatMoney, lineDescription } from '@/lib/invoices/model'

export interface BillingSubscription {
    plan: string | null
    status: string | null
    provider: string | null
    currency: string | null
    plan_amount: number | null
    trial_ends_at: string | null
    current_period_end: string | null
    past_due_since: string | null
}

export interface BillingInvoiceRow {
    id: string
    number: string
    receipt_number: string
    status: string
    currency: string
    total: number
    description: string
    paid_at: string
}

export interface BillingViewProps {
    email: string
    sub: BillingSubscription | null
    invoices: BillingInvoiceRow[] | null
    invoicesError: boolean
    profile: { full_name: string | null; company_name: string | null; billing_address: string | null; tax_id: string | null } | null
    success?: string
    error?: string
}

const ERRORS: Record<string, string> = {
    card_link_failed: "We couldn't open the card update page. Please try again in a minute.",
    no_subscription: "You don't have a subscription yet.",
}

function statusBadge(status: string | null, cancelAtEnd: boolean) {
    if (cancelAtEnd || status === 'non_renewing') return { label: 'Cancelled', tone: 'muted' as const }
    switch (status) {
        case 'trialing': return { label: 'Free trial', tone: 'accent' as const }
        case 'active': return { label: 'Active', tone: 'accent' as const }
        case 'past_due': return { label: 'Payment failed', tone: 'warning' as const }
        case 'paused': return { label: 'Paused', tone: 'muted' as const }
        default: return { label: 'Ended', tone: 'muted' as const }
    }
}

/** Presentational: everything on /billing, from already-loaded data. */
export default function BillingView({ email, sub, invoices, invoicesError, profile, success, error }: BillingViewProps) {
    const hasSub = !!sub?.status && !['canceled', 'incomplete_expired', 'unpaid'].includes(sub.status)
    const paying = hasSub && !!sub?.provider // has a card on file with Paystack/Stripe
    const badge = statusBadge(sub?.status ?? null, false)
    const planName = sub?.plan ? lineDescription(sub.plan, null).replace(/\s*\(.*\)$/, '').replace(/^Velodesk /, '') : null
    const price = sub?.plan_amount && sub.currency ? formatMoney(sub.plan_amount, sub.currency) : null
    const cancelled = sub?.status === 'non_renewing'
    const accessEnd = sub?.status === 'trialing' ? sub.trial_ends_at : sub?.current_period_end
    const graceEnd = sub ? accessUntilAfterFailure(sub) : null

    let nextLine: string | null = null
    if (hasSub && sub) {
        if (cancelled) nextLine = `Access until ${formatDate(accessEnd)}. You won't be charged again.`
        else if (sub.status === 'trialing') nextLine = paying
            ? `Free until ${formatDate(sub.trial_ends_at)}, then ${price ?? 'your plan price'} per month, charged automatically.`
            : `Your free trial ends on ${formatDate(sub.trial_ends_at)}. Choose a plan to keep your PMF Score and integrations running.`
        else if (sub.status === 'active') nextLine = `Renews ${formatDate(sub.current_period_end)}${price ? ` for ${price}` : ''}.`
        else if (sub.status === 'past_due') nextLine = `Your last payment was declined. Update your card by ${formatDate(graceEnd)} to keep access.`
    }

    const toneClass = {
        accent: 'bg-accent/10 text-accent border-accent/20',
        warning: 'bg-warning/10 text-warning border-warning/30',
        muted: 'bg-surface-2 text-text-muted border-border-strong',
    }[badge.tone]

    return (
        <main className="min-h-screen bg-bg px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-3xl">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text rounded-md">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back to dashboard
                </Link>
                <h1 className="mt-6 text-3xl font-light">Billing</h1>
                <p className="mt-1 text-text-muted">Your plan, payment card, invoices and receipts.</p>

                {success && (
                    <div role="status" className="mt-6 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/10 p-4 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                        <span>Payment received. Your receipt and invoice are on their way to {email}.</span>
                    </div>
                )}
                {error && (
                    <div role="alert" className="mt-6 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                        <span>{ERRORS[error] ?? 'Something went wrong. Please try again.'}</span>
                    </div>
                )}

                {/* Plan */}
                <section aria-labelledby="plan-h" className="mt-8 rounded-xl border border-border bg-surface p-6">
                    <h2 id="plan-h" className="text-xs font-medium uppercase tracking-wide text-text-muted">Plan</h2>
                    {hasSub && sub ? (
                        <>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <p className="font-display text-2xl">{planName ?? 'Velodesk'}</p>
                                <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${toneClass}`}>{badge.label}</span>
                            </div>
                            {nextLine && <p className="mt-2 text-sm text-text-muted">{nextLine}</p>}
                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                {!paying ? (
                                    <Link href="/pricing" className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">
                                        Choose a plan
                                    </Link>
                                ) : (<>
                                <a
                                    href="/api/billing/card"
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${sub.status === 'past_due' ? 'bg-accent text-on-accent hover:bg-accent-hover' : 'border border-border-strong hover:bg-surface-2'}`}
                                >
                                    <CreditCard className="h-4 w-4" aria-hidden /> {sub.status === 'past_due' ? 'Update payment card' : 'Manage card & subscription'}
                                </a>
                                {!cancelled && (
                                    <p className="text-xs text-text-muted">Update your card or cancel on our payment provider&apos;s secure page.</p>
                                )}
                                </>)}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-3 text-text-muted">You don&apos;t have an active plan.</p>
                            <Link href="/pricing" className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">
                                Choose a plan
                            </Link>
                        </>
                    )}
                </section>

                {/* Invoices */}
                <section aria-labelledby="inv-h" className="mt-6 rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 id="inv-h" className="text-xs font-medium uppercase tracking-wide text-text-muted">Invoices &amp; receipts</h2>
                    </div>
                    {invoicesError ? (
                        <p className="px-6 pb-6 text-sm text-danger">We couldn&apos;t load your invoices. Refresh the page to try again.</p>
                    ) : !invoices?.length ? (
                        <div className="flex items-start gap-3 px-6 pb-6 text-sm text-text-muted">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                            <p>
                                Your invoices and receipts will appear here after your first payment
                                {sub?.status === 'trialing' && sub.trial_ends_at ? ` on ${formatDate(sub.trial_ends_at)}` : ''}. We also email each one to you.
                            </p>
                        </div>
                    ) : (
                        <>
                        {/* Phones: stacked list */}
                        <ul className="divide-y divide-border border-t border-border sm:hidden">
                            {invoices.map(inv => (
                                <li key={inv.id} className="px-6 py-4">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <span className="font-mono tabular-nums">{formatMoney(inv.total, inv.currency)}</span>
                                        <span className="inline-flex items-center gap-1 text-sm text-accent">
                                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                            {inv.status === 'paid' ? 'Paid' : inv.status === 'refunded' ? 'Refunded' : 'Void'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-text-muted">{formatDate(inv.paid_at)} · <span className="font-mono">{inv.number}</span></p>
                                    <div className="mt-3 flex gap-2 text-sm">
                                        <a href={`/api/billing/invoices/${inv.id}/pdf?doc=invoice`} className="inline-flex items-center gap-1 rounded-md border border-border-strong px-3 py-1.5 hover:bg-surface-2" aria-label={`Download invoice ${inv.number}`}>
                                            <Download className="h-3.5 w-3.5" aria-hidden /> Invoice
                                        </a>
                                        <a href={`/api/billing/invoices/${inv.id}/pdf?doc=receipt`} className="inline-flex items-center gap-1 rounded-md border border-border-strong px-3 py-1.5 hover:bg-surface-2" aria-label={`Download receipt ${inv.receipt_number}`}>
                                            <Download className="h-3.5 w-3.5" aria-hidden /> Receipt
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[560px] text-sm">
                                <thead>
                                    <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-text-muted">
                                        <th scope="col" className="px-6 py-3 font-medium">Date</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Invoice</th>
                                        <th scope="col" className="px-3 py-3 text-right font-medium">Amount</th>
                                        <th scope="col" className="px-3 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right font-medium">Download</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                                            <td className="whitespace-nowrap px-6 py-3">{formatDate(inv.paid_at)}</td>
                                            <td className="px-3 py-3">
                                                <span className="whitespace-nowrap font-mono text-xs">{inv.number}</span>
                                                <span className="block text-xs text-text-muted">{inv.description.replace(/\s*\(.*\)$/, '')}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono tabular-nums">{formatMoney(inv.total, inv.currency)}</td>
                                            <td className="px-3 py-3">
                                                <span className="inline-flex items-center gap-1 text-accent">
                                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                                    {inv.status === 'paid' ? 'Paid' : inv.status === 'refunded' ? 'Refunded' : 'Void'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-3 text-right">
                                                <a href={`/api/billing/invoices/${inv.id}/pdf?doc=invoice`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2" aria-label={`Download invoice ${inv.number}`}>
                                                    <Download className="h-3.5 w-3.5" aria-hidden /> Invoice
                                                </a>
                                                <a href={`/api/billing/invoices/${inv.id}/pdf?doc=receipt`} className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-2" aria-label={`Download receipt ${inv.receipt_number}`}>
                                                    <Download className="h-3.5 w-3.5" aria-hidden /> Receipt
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}
                </section>

                {/* Billing details */}
                <section aria-labelledby="details-h" className="mt-6 rounded-xl border border-border bg-surface p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 id="details-h" className="text-xs font-medium uppercase tracking-wide text-text-muted">Billing details</h2>
                        <Link href="/dashboard/settings#billing" className="rounded-md text-sm text-accent hover:underline">Edit</Link>
                    </div>
                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div><dt className="text-text-muted">Billed to</dt><dd className="mt-1">{profile?.company_name || profile?.full_name || email}</dd></div>
                        <div><dt className="text-text-muted">Email</dt><dd className="mt-1">{email}</dd></div>
                        <div><dt className="text-text-muted">Address</dt><dd className="mt-1 whitespace-pre-line">{profile?.billing_address || <span className="text-text-muted">Not added</span>}</dd></div>
                        <div><dt className="text-text-muted">Tax ID (TIN / VAT)</dt><dd className="mt-1">{profile?.tax_id || <span className="text-text-muted">Not added</span>}</dd></div>
                    </dl>
                    <p className="mt-4 text-xs text-text-muted">These details appear on future invoices. Issued invoices don&apos;t change.</p>
                </section>
            </div>
        </main>
    )
}
