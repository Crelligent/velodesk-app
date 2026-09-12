import { createClient } from '@/lib/supabase/server'
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
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

    // If no subscription at all, or incomplete, force them to pick a plan
    if (!subscription || subscription.status === 'incomplete') {
        redirect('/pricing?error=subscription_required')
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
