'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { savePrivacyChoices } from '@/app/welcome/privacy/actions'
import type { PrivacyChoices } from '@/lib/privacy'

interface Props {
    initial: PrivacyChoices
    /** Partner programme the founder joined through; the benchmark switch only shows for members */
    programmeName?: string | null
    mode: 'welcome' | 'settings'
    next?: string
}

function Switch({ id, checked, onChange, title, body }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; body: string }) {
    return (
        <label htmlFor={id} className="flex items-start gap-4 p-4 bg-surface-2 border border-border rounded-lg cursor-pointer hover:border-border-strong transition">
            <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-accent cursor-pointer" />
            <span>
                <span className="block text-sm text-text font-medium">{title}</span>
                <span className="block text-sm text-text-muted mt-1">{body}</span>
            </span>
        </label>
    )
}

export function PrivacyChoicesForm({ initial, programmeName, mode, next = '/dashboard' }: Props) {
    const [choices, setChoices] = useState<PrivacyChoices>(initial)
    const [status, setStatus] = useState<'idle' | 'saved' | { error: string }>('idle')
    const [pending, start] = useTransition()
    const router = useRouter()
    const set = (k: keyof PrivacyChoices) => (v: boolean) => { setChoices(c => ({ ...c, [k]: v })); setStatus('idle') }

    const submit = () => start(async () => {
        const res = await savePrivacyChoices(choices)
        if (!res.ok) { setStatus({ error: res.message }); return }
        if (mode === 'welcome') router.push(next)
        else { setStatus('saved'); router.refresh() }
    })

    return (
        <div className="flex flex-col gap-3">
            {programmeName && (
                <Switch id="pc-benchmark" checked={choices.benchmark} onChange={set('benchmark')}
                    title={`Include my scores in the ${programmeName} benchmark`}
                    body="Founders in your programme see how they compare, from anonymised combined figures. Nothing is shown until 5 companies take part, and no company is named." />
            )}
            <Switch id="pc-emails" checked={choices.productEmails} onChange={set('productEmails')}
                title="Product updates and tips by email"
                body="Occasional emails about new features and how to raise your scores. Account and security emails are sent either way." />
            <Switch id="pc-analytics" checked={choices.usageAnalytics} onChange={set('usageAnalytics')}
                title="Help improve Velodesk"
                body="Lets the website measure how its public pages are used, with cookies from Google Tag Manager, Apollo and Microsoft Clarity. Never on your dashboard. Off means none of these load." />

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                <button type="button" onClick={submit} disabled={pending}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-accent-hover transition disabled:opacity-60">
                    {pending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                    {mode === 'welcome' ? (pending ? 'Saving…' : 'Continue') : (pending ? 'Saving…' : 'Save choices')}
                </button>
                <p className="text-xs text-text-muted">You can change these at any time in Settings.</p>
            </div>
            <div aria-live="polite">
                {status === 'saved' && <p className="flex items-center gap-2 text-sm text-accent"><CheckCircle2 size={14} aria-hidden="true" />Saved.</p>}
                {typeof status === 'object' && <p className="flex items-center gap-2 text-sm text-danger"><AlertCircle size={14} aria-hidden="true" />{status.error}</p>}
            </div>
        </div>
    )
}
