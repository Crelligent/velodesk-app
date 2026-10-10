/**
 * "Heads-up" emails a few days before each charge. Server only (service-role client).
 * Run daily by /api/cron/billing-reminders (Vercel Cron, see vercel.json).
 *
 * Who gets one: subscriptions with a card on file (provider set) that will be charged
 * within BILLING_REMINDER_DAYS (default 3):
 *   - status 'active'   -> renewal on current_period_end
 *   - status 'trialing' -> first charge on trial_ends_at (card-at-signup trials)
 * Cancelled (non_renewing), past_due and card-less trials get nothing.
 * One email per charge date: `upcoming_charge_notified_for` stores the date it was sent for.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/mailer'
import { lineDescription } from './model'
import { upcomingChargeEmail } from './emails'

export interface ReminderCandidate {
    user_id: string
    plan: string | null
    status: string | null
    provider: string | null
    currency: string | null
    plan_amount: number | null
    trial_ends_at: string | null
    current_period_end: string | null
    upcoming_charge_notified_for: string | null
}

export interface DueReminder {
    row: ReminderCandidate
    chargeDate: string
    trialEnding: boolean
}

const DAY = 24 * 60 * 60 * 1000

export function reminderDays(env: Record<string, string | undefined> = process.env): number {
    const n = Number((env.BILLING_REMINDER_DAYS ?? '').trim() || 3)
    return Number.isFinite(n) && n >= 1 && n <= 14 ? Math.round(n) : 3
}

/** Pure: which rows are due a heads-up now. */
export function dueReminders(rows: ReminderCandidate[], now = new Date(), days = 3): DueReminder[] {
    const out: DueReminder[] = []
    for (const row of rows) {
        if (!row.provider) continue
        const trialEnding = row.status === 'trialing'
        if (!trialEnding && row.status !== 'active') continue
        const chargeDate = trialEnding ? row.trial_ends_at : row.current_period_end
        if (!chargeDate) continue
        const t = new Date(chargeDate).getTime()
        if (!(t > now.getTime() && t <= now.getTime() + days * DAY)) continue
        if (row.upcoming_charge_notified_for && new Date(row.upcoming_charge_notified_for).getTime() === t) continue
        out.push({ row, chargeDate, trialEnding })
    }
    return out
}

export async function sendUpcomingChargeReminders(admin: SupabaseClient, now = new Date()) {
    const { data, error } = await admin
        .from('subscriptions')
        .select('user_id, plan, status, provider, currency, plan_amount, trial_ends_at, current_period_end, upcoming_charge_notified_for')
        .in('status', ['active', 'trialing'])
        .not('provider', 'is', null)
    if (error) throw error

    const due = dueReminders((data ?? []) as ReminderCandidate[], now, reminderDays())
    let sent = 0
    const failed: string[] = []
    for (const { row, chargeDate, trialEnding } of due) {
        // Claim this charge date first so overlapping runs never double-send
        const { data: claimed, error: claimError } = await admin
            .from('subscriptions')
            .update({ upcoming_charge_notified_for: chargeDate })
            .eq('user_id', row.user_id)
            .eq('status', row.status)
            .or(`upcoming_charge_notified_for.is.null,upcoming_charge_notified_for.neq."${chargeDate}"`)
            .select('user_id')
        if (claimError || !claimed?.length) continue

        const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', row.user_id).maybeSingle()
        let email: string | null = profile?.email ?? null
        if (!email) email = (await admin.auth.admin.getUserById(row.user_id)).data?.user?.email ?? null
        const content = upcomingChargeEmail({
            name: profile?.full_name ?? null,
            planName: lineDescription(row.plan, null).replace(/\s*\(.*\)$/, ''),
            amountMinor: row.plan_amount,
            currency: row.currency,
            chargeDate,
            trialEnding,
        })
        const result = email ? await sendMail({ to: email, ...content }) : { sent: false as const, error: 'no_email' }
        if (result.sent) sent++
        else {
            failed.push(row.user_id)
            await admin.from('subscriptions')
                .update({ upcoming_charge_notified_for: row.upcoming_charge_notified_for })
                .eq('user_id', row.user_id)
        }
    }
    return { due: due.length, sent, failed: failed.length }
}
