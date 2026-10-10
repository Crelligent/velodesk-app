/**
 * Velodesk plans, entitlement and server-side limit enforcement.
 * Plan ids match src/app/pricing/page.tsx (founder_monthly, startup_monthly, ...).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type PlanTier = 'free' | 'founder' | 'startup' | 'accelerator' | 'pro' | 'enterprise'

export interface PlanLimits {
    pmfScores: number // Infinity = unlimited
    integrations: number
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
    // ASSUMPTION (needs product sign-off): users without a usable subscription get Founder limits.
    free: { pmfScores: 3, integrations: 5 },
    founder: { pmfScores: 3, integrations: 5 },
    startup: { pmfScores: Infinity, integrations: Infinity },
    accelerator: { pmfScores: Infinity, integrations: Infinity },
    pro: { pmfScores: Infinity, integrations: Infinity }, // legacy plan name
    enterprise: { pmfScores: Infinity, integrations: Infinity },
}

export const TRIAL_DAYS = 14
/** Plans a self-serve trial may grant (user_metadata is user-editable, so never more). */
const TRIAL_PLANS: PlanTier[] = ['founder', 'startup']
/** Grace after current_period_end for renewal webhooks to arrive. */
const PERIOD_GRACE_MS = 3 * 24 * 60 * 60 * 1000

/** 'founder_monthly' / 'startup_yearly_ngn' / 'founder' -> 'founder' */
export function planTierFromPlanId(planId: string | null | undefined): PlanTier | null {
    if (!planId) return null
    const tier = planId.toLowerCase().split('_')[0]
    return tier in PLAN_LIMITS ? (tier as PlanTier) : null
}

export interface SubscriptionRow {
    plan?: string | null
    status?: string | null
    provider?: string | null
    trial_ends_at?: string | null
    current_period_end?: string | null
}

export type EntitlementReason =
    | 'subscription_required'
    | 'trial_ended'
    | 'subscription_ended'
    | 'paused'

/**
 * Single source of truth for "may this user use their paid plan right now?"
 * Used by the dashboard layout and by getUserPlan (limits).
 */
export function getEntitlement(
    sub: SubscriptionRow | null,
    now = new Date()
): { entitled: boolean; reason?: EntitlementReason } {
    if (!sub?.status) return { entitled: false, reason: 'subscription_required' }

    const before = (iso: string | null | undefined, graceMs = 0) =>
        !!iso && now.getTime() < new Date(iso).getTime() + graceMs
    const periodOk = !sub.current_period_end || before(sub.current_period_end, PERIOD_GRACE_MS)

    switch (sub.status) {
        case 'trialing':
            return before(sub.trial_ends_at)
                ? { entitled: true }
                : { entitled: false, reason: 'trial_ended' }
        case 'active':
        case 'past_due': // dunning: keep access while the provider retries (layout shows a banner)
            return periodOk ? { entitled: true } : { entitled: false, reason: 'subscription_ended' }
        case 'non_renewing': // cancelled, but paid until the end of the period
            return before(sub.current_period_end)
                ? { entitled: true }
                : { entitled: false, reason: 'subscription_ended' }
        case 'paused':
            return { entitled: false, reason: 'paused' }
        case 'incomplete':
            return { entitled: false, reason: 'subscription_required' }
        default: // canceled, unpaid, incomplete_expired
            return { entitled: false, reason: 'subscription_ended' }
    }
}

export async function getUserPlan(
    supabase: SupabaseClient,
    userId: string
): Promise<{ tier: PlanTier; status: string | null; limits: PlanLimits }> {
    const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status, provider, trial_ends_at, current_period_end')
        .eq('user_id', userId)
        .maybeSingle()

    const tier: PlanTier = getEntitlement(sub).entitled
        ? planTierFromPlanId(sub?.plan) ?? 'free'
        : 'free'
    return { tier, status: sub?.status ?? null, limits: PLAN_LIMITS[tier] }
}

/**
 * Creates the server-side 14-day trial ONCE per user (no-op if any subscription
 * row already exists, so trials are never re-granted). Requires the service role.
 */
export async function ensureTrial(
    admin: SupabaseClient,
    user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
): Promise<void> {
    const userId = user.id
    const selectedPlan = user.user_metadata?.selected_plan

    // subscriptions.user_id references profiles(id): make sure the profile exists
    // (the signup trigger may not have created it). Never overwrites an existing profile.
    const { error: profileError } = await admin.from('profiles').upsert(
        {
            id: userId,
            email: user.email ?? '',
            full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        },
        { onConflict: 'id', ignoreDuplicates: true }
    )
    if (profileError) throw profileError

    const requested = planTierFromPlanId(typeof selectedPlan === 'string' ? selectedPlan : null)
    const plan = requested && TRIAL_PLANS.includes(requested) ? requested : 'founder'

    const { error } = await admin.from('subscriptions').upsert(
        {
            user_id: userId,
            plan,
            status: 'trialing',
            provider: null,
            trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
    )
    if (error) throw error
}

/**
 * Returns an error message if connecting `provider` would exceed the plan's
 * integration limit, otherwise null. Re-connecting an existing provider is always allowed.
 */
export async function checkIntegrationLimit(
    supabase: SupabaseClient,
    userId: string,
    provider: string
): Promise<string | null> {
    const { tier, limits } = await getUserPlan(supabase, userId)
    if (!Number.isFinite(limits.integrations)) return null

    const { data: rows } = await supabase
        .from('integration_tokens')
        .select('provider')
        .eq('user_id', userId)
        .eq('status', 'connected')

    const others = (rows || []).filter(r => r.provider !== provider).length
    if (others >= limits.integrations) {
        return `Your ${tier} plan allows ${limits.integrations} active integrations. Disconnect one or upgrade.`
    }
    return null
}
