import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendUpcomingChargeReminders } from '@/lib/invoices/reminders'

export const maxDuration = 120

/**
 * GET /api/cron/billing-reminders: daily "your plan renews in N days" emails.
 * Scheduled in vercel.json; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 */
function authorized(request: Request) {
    const secret = (process.env.CRON_SECRET || '').trim()
    const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
    if (!secret || !given) return false
    const a = Buffer.from(secret)
    const b = Buffer.from(given)
    return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: Request) {
    if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
        const result = await sendUpcomingChargeReminders(createAdminClient())
        return NextResponse.json(result)
    } catch (error) {
        console.error('Billing reminders failed:', error instanceof Error ? error.message : error)
        return NextResponse.json({ error: 'Reminder run failed' }, { status: 500 })
    }
}
