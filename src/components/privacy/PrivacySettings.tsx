'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PERKS } from '@/lib/perks'
import { fromRow, type PrivacyChoices } from '@/lib/privacy'
import { PrivacyChoicesForm } from './PrivacyChoicesForm'

/** Settings → Privacy: the same opt-in switches as the first-run screen. */
export function PrivacySettings() {
    const [state, setState] = useState<{ choices: PrivacyChoices; programmeName: string | null } | 'loading' | 'error'>('loading')

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { setState('error'); return }
            const [c, m] = await Promise.all([
                supabase.from('privacy_choices').select('benchmark, product_emails, usage_analytics').eq('user_id', user.id).maybeSingle(),
                supabase.from('programme_members').select('programme').eq('user_id', user.id).maybeSingle(),
            ])
            if (c.error) { setState('error'); return }
            setState({ choices: fromRow(c.data), programmeName: m.data?.programme ? (PERKS[m.data.programme]?.partner ?? null) : null })
        })
    }, [])

    return (
        <section aria-labelledby="privacy-heading" className="p-6 bg-surface border border-border rounded-lg mb-6">
            <h2 id="privacy-heading" className="text-lg font-medium mb-2">Privacy</h2>
            <p className="text-sm text-text-muted mb-5">Optional uses of your data. Each is off unless you turn it on.</p>
            {state === 'loading' ? (
                <div className="flex flex-col gap-3" aria-hidden="true">
                    {[0, 1, 2].map(i => <div key={i} className="h-20 bg-surface-2 rounded-lg animate-pulse" />)}
                </div>
            ) : state === 'error' ? (
                <p className="text-sm text-text-muted">We couldn&apos;t load your privacy choices. Refresh the page to try again.</p>
            ) : (
                <PrivacyChoicesForm initial={state.choices} programmeName={state.programmeName} mode="settings" />
            )}
        </section>
    )
}
