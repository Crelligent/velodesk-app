'use client'

import { useActionState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { shareWithInvestor, type ShareState } from './actions'

export function ShareForm({ disabled }: { disabled?: boolean }) {
    const [state, action, pending] = useActionState<ShareState, FormData>(shareWithInvestor, { status: 'idle' })

    return (
        <form action={action} className="flex flex-col gap-2">
            <label htmlFor="investor-email" className="text-sm text-text">Investor&apos;s email</label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    id="investor-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="name@fund.com"
                    disabled={disabled || pending}
                    aria-describedby="investor-email-help"
                    className="flex-1 px-3 py-2 bg-surface-2 border border-border-strong rounded-md text-sm text-text placeholder:text-text-dim disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={disabled || pending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-accent-hover transition disabled:opacity-60"
                >
                    {pending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                    {pending ? 'Sharing…' : 'Share my scores'}
                </button>
            </div>
            <p id="investor-email-help" className="text-xs text-text-muted">
                They&apos;ll see your PMF Score and Go-to-Market Score when they sign in to Velodesk with this email. Nothing else from your account is shared.
            </p>
            <div aria-live="polite">
                {state.status === 'error' && (
                    <p className="flex items-center gap-2 text-sm text-danger"><AlertCircle size={14} aria-hidden="true" />{state.message}</p>
                )}
                {state.status === 'ok' && (
                    <p className="flex items-center gap-2 text-sm text-accent">
                        <CheckCircle2 size={14} aria-hidden="true" />
                        {state.emailed
                            ? `Shared with ${state.email}. We've emailed them to let them know.`
                            : `Shared with ${state.email}. Let them know they can sign in to Velodesk with that email to see your scores.`}
                    </p>
                )}
            </div>
        </form>
    )
}
