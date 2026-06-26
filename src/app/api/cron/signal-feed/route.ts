import { NextResponse } from 'next/server'

// Templates for pre-AI Phase 1
const templates: Record<string, { down: { signal: string, suggests: string, action: string } }> = {
    retention: {
        down: {
            signal: 'Retention dropped from {X}/5 to {Y}/5 this week.\nLess than 25% of your week-4 cohort returned.',
            suggests: 'Users are trying your product but failing to build a habit. The core value may not be realized fast enough.',
            action: 'Set up an automated email sequence for day 3 and day 7 highlighting your most sticky feature.\nEstimated time: 1.5 hours'
        }
    },
    willingnessToPay: {
        down: {
            signal: 'Willingness to Pay dropped from {X}/5 to {Y}/5 this week.\nFull-price conversions are below 60%.',
            suggests: 'Your pricing might be misaligned with the perceived value, or discounts are cannibalizing full-price sales.',
            action: 'Run an A/B test removing the primary discount code for 50% of traffic to measure true price sensitivity.\nEstimated time: 1 hour'
        }
    },
    organicGrowth: {
        down: {
            signal: 'Organic Growth dropped from {X}/5 to {Y}/5 this week.\nReferrals account for less than 20% of acquisition.',
            suggests: 'Your current users are satisfied but not sufficiently motivated to advocate for the product.',
            action: 'Add a high-visibility, incentivized referral prompt immediately after the core "aha" moment.\nEstimated time: 2 hours'
        }
    },
    activeUsage: {
        down: {
            signal: 'Active Usage dropped from {X}/5 to {Y}/5 this week.\nCore action completion fell below 50%.',
            suggests: 'Friction in the user journey is preventing activated users from completing the core action.',
            action: 'Review Session Replays (like Clarity or PostHog) for the specific page where the drop-off occurs.\nEstimated time: 45 minutes'
        }
    },
    urgency: {
        down: {
            signal: 'Urgency of Problem dropped from {X}/5 to {Y}/5 this week.\nTime-to-first-use exceeded 3 days.',
            suggests: 'The problem you are solving is not painful enough to force immediate behavioral change.',
            action: 'Revise onboarding copy to focus on the cost of inaction rather than just product benefits.\nEstimated time: 1 hour'
        }
    },
    substituteResistance: {
        down: {
            signal: 'Substitute Resistance dropped from {X}/5 to {Y}/5 this week.\nChurn exit surveys show increasing alternative adoption.',
            suggests: 'Your product is not dramatically faster or easier than existing workarounds or competitors.',
            action: 'Schedule 3 user interviews. Ask: "Walk me through the last time you switched to an alternative. Why?"\nEstimated time: 2 hours'
        }
    },
    commercialCoherence: {
        down: {
            signal: 'Commercial Coherence dropped from {X}/5 to {Y}/5 this week.\nContribution margins are trending negative.',
            suggests: 'Your acquisition or servicing costs are scaling faster than your revenue per user.',
            action: 'Analyze your highest-cost cohort. Can you introduce a usage tier or limit to cap these costs?\nEstimated time: 3 hours'
        }
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // TODO: Initialize Supabase Admin client
        // TODO: Fetch active users and their PMF history
        // TODO: For each user, find max drop and generate message
        // TODO: Send via WhatsApp / Resend
        // TODO: Log to signal_feed_log table

        // Mock response for now
        console.log("Velodesk Signal Feed Triggered")

        return NextResponse.json({ success: true, processed: 0 })
    } catch (error) {
        console.error('Error generating signal feed:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
