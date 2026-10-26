'use client'

import { useActionState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { connectHubSpot, syncNow, type ConnectState } from './actions'

export function ConnectForm({ disabled }: { disabled?: boolean }) {
    const [state, action, pending] = useActionState<ConnectState, FormData>(connectHubSpot, { status: 'idle' })
    return (
        <form action={action} className="flex flex-col gap-2">
            <label htmlFor="hs-token" className="text-sm text-text">Private app access token</label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    id="hs-token" name="token" type="password" required autoComplete="off" placeholder="pat-..."
                    disabled={disabled || pending} aria-describedby="hs-token-help"
                    className="flex-1 px-3 py-2 bg-surface-2 border border-border-strong rounded-md text-sm text-text placeholder:text-text-dim disabled:opacity-60"
                />
                <button type="submit" disabled={disabled || pending}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-accent-hover transition disabled:opacity-60">
                    {pending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                    {pending ? 'Connecting…' : 'Connect HubSpot'}
                </button>
            </div>
            <p id="hs-token-help" className="text-xs text-text-muted max-w-prose">
                In HubSpot: Settings → Integrations → Private Apps → Create a private app. Give it these scopes: crm.objects.deals.read, crm.objects.deals.write, crm.objects.companies.read, crm.schemas.deals.read and crm.schemas.deals.write. Paste the token here; it&apos;s stored server-side and never shown again.
            </p>
            <div aria-live="polite">
                {state.status === 'error' && <p className="flex items-center gap-2 text-sm text-danger"><AlertCircle size={14} aria-hidden="true" />{state.message}</p>}
                {state.status === 'ok' && <p className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 size={14} aria-hidden="true" />Connected. The first sync has run; results are below.</p>}
            </div>
        </form>
    )
}

export function SyncButton() {
    const [pending, start] = useTransition()
    return (
        <button type="button" disabled={pending} onClick={() => start(async () => { await syncNow() })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-accent-hover transition disabled:opacity-60">
            <RefreshCw size={14} className={pending ? 'animate-spin' : ''} aria-hidden="true" />
            {pending ? 'Syncing…' : 'Sync now'}
        </button>
    )
}
