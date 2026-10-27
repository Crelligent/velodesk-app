import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureTrial, getEntitlement } from '@/lib/plans'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PERK_COOKIE } from '@/lib/perks'
import DashboardClientLayout from '@/components/dashboard/DashboardClientLayout'
import { DEMO_EMAILS } from '@/lib/demo'
import { needsPrivacyChoices } from '@/lib/privacy-server'

function daysUntil(iso: string): number {
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000))
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Enforce subscription requirement
    const loadSubscription = () => supabase
        .from('subscriptions')
        .select('plan, status, provider, trial_ends_at, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

    let { data: subscription } = await loadSubscription()

    // First visit: start the server-side trial (14 days, or the partner perk length; once per user)
    if (!subscription) {
        try {
            await ensureTrial(createAdminClient(), user, (await cookies()).get(PERK_COOKIE)?.value)
            subscription = (await loadSubscription()).data
        } catch (error) {
            console.error('Failed to start trial:', error)
        }
        // A parallel first request (e.g. a prefetch) may have created the trial meanwhile
        if (!subscription) subscription = (await loadSubscription()).data
    }

    // Expired trial / ended subscription -> pricing, with a reason the page can show
    // (?error=trial_ended -> "Your trial has ended"). 'paused' stays read-only below.
    const { entitled, reason } = getEntitlement(subscription)
    if (!subscription || (!entitled && reason !== 'paused')) {
        redirect(`/pricing?error=${reason ?? 'subscription_required'}`)
    }

    // If past_due, we could show a banner in the client layout, but we still render children
    // Same for paused (read-only). 

    // First visit after sign-up (and once for existing users): the privacy choices screen
    if (await needsPrivacyChoices(supabase, user)) redirect('/welcome/privacy?next=/dashboard')

    const tier = (subscription.plan || 'founder').split('_')[0]
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)
    let planLabel = `${tierName} plan`
    if (subscription.status === 'trialing' && subscription.trial_ends_at) {
        const days = daysUntil(subscription.trial_ends_at)
        planLabel = `${tierName} trial · ${days} day${days === 1 ? '' : 's'} left`
    }
    const fullName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''

    return (
        <DashboardClientLayout
            user={{
                email: user.email || '',
                name: fullName || (user.email || '').split('@')[0],
                avatarUrl: user.user_metadata?.avatar_url,
                planLabel,
                isDemo: DEMO_EMAILS.has((user.email || '').toLowerCase()),
            }}
        >
            {/* Inject a banner if past_due or paused? Let's just render children for now */}
            {subscription.status === 'past_due' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <span>Your last payment was declined. Update your card to avoid interruption.</span>
                    <a href="/billing" className="px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30 transition text-sm">Update card</a>
                </div>
            )}
            {subscription.status === 'paused' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-lg mb-6">
                    <strong>Read-Only Mode:</strong> Your subscription has been paused. You can view your historical data, but cannot run new PMF scores.
                </div>
            )}
            {children}
        </DashboardClientLayout>
    )
}
