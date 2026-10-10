import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BillingView from './BillingView'

export const metadata = { title: 'Billing | Velodesk' }

/**
 * /billing: plan, card, invoices & receipts.
 * Deliberately OUTSIDE /dashboard so customers whose access is locked (trial ended,
 * card declined) can still update their card and download past invoices.
 */
type Search = Promise<{ success?: string; error?: string }>

export default async function BillingPage({ searchParams }: { searchParams: Search }) {
    const { success, error } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login?next=/billing')

    const [{ data: sub }, { data: invoices, error: invoicesError }, { data: profile }] = await Promise.all([
        supabase
            .from('subscriptions')
            .select('plan, status, provider, currency, plan_amount, trial_ends_at, current_period_end, past_due_since')
            .eq('user_id', user.id)
            .maybeSingle(),
        supabase
            .from('invoices')
            .select('id, number, receipt_number, status, currency, total, description, paid_at')
            .eq('user_id', user.id)
            .order('issued_at', { ascending: false })
            .limit(100),
        supabase.from('profiles').select('full_name, company_name, billing_address, tax_id').eq('id', user.id).maybeSingle(),
    ])

    return (
        <BillingView
            email={user.email ?? ''}
            sub={sub}
            invoices={invoices}
            invoicesError={!!invoicesError}
            profile={profile}
            success={success}
            error={error}
        />
    )
}
