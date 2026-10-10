import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureTrial, getEntitlement } from '@/lib/plans'
import { redirect } from 'next/navigation'
import DashboardClientLayout from '@/components/dashboard/DashboardClientLayout'

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

    // First visit: start the server-side 14-day trial (once per user, never re-granted)
    if (!subscription) {
        try {
            await ensureTrial(createAdminClient(), user)
            subscription = (await loadSubscription()).data
        } catch (error) {
            console.error('Failed to start trial:', error)
        }
    }

    // Expired trial / ended subscription -> pricing, with a reason the page can show
    // (?error=trial_ended -> "Your trial has ended"). 'paused' stays read-only below.
    const { entitled, reason } = getEntitlement(subscription)
    if (!subscription || (!entitled && reason !== 'paused')) {
        redirect(`/pricing?error=${reason ?? 'subscription_required'}`)
    }

    // If past_due, we could show a banner in the client layout, but we still render children
    // Same for paused (read-only). 

    return (
        <DashboardClientLayout
            user={{
                email: user.email || '',
                avatarUrl: user.user_metadata?.avatar_url
            }}
        >
            {/* Inject a banner if past_due or paused? Let's just render children for now */}
            {subscription.status === 'past_due' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <span>Your payment method failed. Please update your billing details to avoid interruption.</span>
                    <a href="/dashboard/settings" className="px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30 transition text-sm">Update Card</a>
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
