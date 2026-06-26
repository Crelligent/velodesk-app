export interface User {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
}

export interface Profile {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
    role: string | null
    avatar_url: string | null
    created_at: string
}

export interface Organization {
    id: string
    name: string
    industry: string | null
    size: string | null
    owner_id: string
    created_at: string
}

export interface Integration {
    id: string
    org_id: string
    provider: 'stripe' | 'mixpanel' | 'amplitude' | 'hubspot' | 'intercom' | 'segment' | 'paystack' | 'google-analytics'
    access_token: string | null
    refresh_token: string | null
    status: 'pending' | 'connected' | 'error'
    last_sync: string | null
    created_at: string
}

export interface PMFScore {
    id: string
    org_id: string
    score: number
    breakdown: {
        retention: number
        growth: number
        engagement: number
        revenue: number
        satisfaction: number
    }
    calculated_at: string
}

export interface Subscription {
    id: string
    org_id: string
    plan: 'free' | 'pro' | 'enterprise'
    provider: 'stripe' | 'paystack' | null
    provider_subscription_id: string | null
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    current_period_end: string | null
    created_at: string
}
