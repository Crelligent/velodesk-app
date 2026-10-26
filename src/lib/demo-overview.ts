// Placeholder business figures for the shared demo founder account (Brightloop, fictional).
// Shown ONLY to DEMO_EMAILS accounts, labelled as sample data. Real accounts never see these.

export interface DemoKpi {
    label: string
    value: string
    delta: string
    trend: 'up' | 'down'
    good: boolean
    hint: string
    spark: number[]
}

export const DEMO_KPIS: DemoKpi[] = [
    { label: 'MRR', value: '$48.2k', delta: '+12.4% MoM', trend: 'up', good: true, hint: 'Stripe + Paystack', spark: [29, 31, 34, 36, 39, 43, 48] },
    { label: 'Paying customers', value: '214', delta: '+18 this month', trend: 'up', good: true, hint: 'Stripe + Paystack', spark: [142, 151, 163, 175, 188, 196, 214] },
    { label: 'Net revenue retention', value: '112%', delta: '+4 pts', trend: 'up', good: true, hint: 'Expansion minus churn', spark: [101, 103, 104, 106, 108, 108, 112] },
    { label: 'Logo churn', value: '2.1%', delta: '-0.6 pts', trend: 'down', good: true, hint: 'Monthly, paying accounts', spark: [4.2, 3.8, 3.4, 3.1, 2.9, 2.7, 2.1] },
    { label: 'Weekly active users', value: '3,870', delta: '+9.1%', trend: 'up', good: true, hint: 'PostHog + Mixpanel', spark: [2610, 2790, 2950, 3180, 3420, 3550, 3870] },
    { label: 'Time to value', value: '3.2 days', delta: '+0.4 days', trend: 'up', good: false, hint: 'Sign-up to first report', spark: [3.9, 3.6, 3.1, 2.9, 2.8, 2.8, 3.2] },
]

export const DEMO_RETENTION = {
    label: 'Week-8 retention by sign-up cohort',
    cohorts: [
        { month: 'Apr', value: 41 },
        { month: 'May', value: 46 },
        { month: 'Jun', value: 52 },
        { month: 'Jul', value: 55 },
        { month: 'Aug', value: 61 },
        { month: 'Sep', value: 64 },
    ],
}

export const DEMO_SIGNALS = [
    { when: 'Today', tone: 'positive' as const, title: 'Expansion revenue up 18% this month', detail: '11 accounts upgraded to the Team plan after the reporting launch.' },
    { when: 'Yesterday', tone: 'warning' as const, title: 'Time to value slipped to 3.2 days', detail: 'New sign-ups from paid search take longer to connect their first data source.' },
    { when: '3 days ago', tone: 'positive' as const, title: 'NPS rose from 41 to 47', detail: 'Typeform survey, 126 responses. Promoters cite the weekly investor report.' },
    { when: '5 days ago', tone: 'warning' as const, title: 'Referral share is still low at 9%', detail: 'HubSpot attributes few new deals to customer referrals.' },
]

export const DEMO_ACTIONS = [
    'Add a guided "connect your first source" step for paid-search sign-ups to bring time to value under 2 days.',
    'Launch an in-app referral prompt after the first weekly report, when satisfaction peaks.',
    'Share the Data Room with your lead investor before the seed round: PMF Score 69 and rising.',
]

// Go-to-Market Score for the demo founder (Brightloop, fictional). Sample data, demo accounts only.
export const DEMO_GTM = {
    score: 66,
    history: [52, 55, 58, 61, 63, 66],
    components: {
        winRate: { score: 74, value: 27.5, unit: '%' },
        pipelineGrowth: { score: 64, value: 11.6, unit: '% change' },
        leadConversion: { score: 60, value: 3.4, unit: '%' },
        dealSpeed: { score: 66, value: 51, unit: 'days' },
    },
} as const
