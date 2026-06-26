/**
 * Velodesk Integrations Module
 * Handles OAuth connections and data sync with external services
 */

import { createClient } from '@/lib/supabase/client'

// =================== TYPES ===================

export interface Integration {
    id: string
    name: string
    icon: string
    description: string
    category: 'analytics' | 'payments' | 'crm' | 'support'
    authType: 'oauth' | 'api_key'
    recommended?: boolean
}

export interface IntegrationStatus {
    provider: string
    connected: boolean
    connectedAt?: string
    status: 'connected' | 'expired' | 'error' | 'disconnected'
}

export interface SyncResult {
    provider: string
    success: boolean
    recordsProcessed?: number
    error?: string
    syncedAt: string
}

// =================== AVAILABLE INTEGRATIONS ===================

export const INTEGRATIONS: Integration[] = [
    // Analytics & Product Intelligence
    { id: 'mixpanel', name: 'Mixpanel', icon: '📊', description: 'Product analytics and engagement tracking', category: 'analytics', authType: 'api_key', recommended: true },
    { id: 'amplitude', name: 'Amplitude', icon: '📈', description: 'Product intelligence platform', category: 'analytics', authType: 'api_key' },
    { id: 'google-analytics', name: 'Google Analytics', icon: '📉', description: 'Web analytics and insights', category: 'analytics', authType: 'oauth' },
    { id: 'segment', name: 'Segment', icon: '🔀', description: 'Customer data platform', category: 'analytics', authType: 'api_key', recommended: true },
    { id: 'hotjar', name: 'Hotjar', icon: '🔥', description: 'Behavior analytics and feedback', category: 'analytics', authType: 'api_key' },
    { id: 'posthog', name: 'PostHog', icon: '🦔', description: 'Open-source product analytics', category: 'analytics', authType: 'api_key' },
    { id: 'heap', name: 'Heap', icon: '📊', description: 'Digital insights platform', category: 'analytics', authType: 'api_key' },
    { id: 'fullstory', name: 'FullStory', icon: '🎬', description: 'Digital experience analytics', category: 'analytics', authType: 'api_key' },

    // Payments & Revenue
    { id: 'stripe', name: 'Stripe', icon: '💳', description: 'Payment processing and revenue data', category: 'payments', authType: 'oauth', recommended: true },
    { id: 'paystack', name: 'Paystack', icon: '💰', description: 'African payment processing', category: 'payments', authType: 'api_key' },
    { id: 'paddle', name: 'Paddle', icon: '🏓', description: 'SaaS billing and payments', category: 'payments', authType: 'api_key' },
    { id: 'chargebee', name: 'Chargebee', icon: '🐝', description: 'Subscription billing platform', category: 'payments', authType: 'api_key' },

    // CRM & Sales
    { id: 'hubspot', name: 'HubSpot', icon: '🧲', description: 'CRM and marketing automation', category: 'crm', authType: 'oauth', recommended: true },
    { id: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Enterprise CRM platform', category: 'crm', authType: 'oauth' },
    { id: 'pipedrive', name: 'Pipedrive', icon: '🎯', description: 'Sales pipeline management', category: 'crm', authType: 'api_key' },
    { id: 'close', name: 'Close', icon: '📞', description: 'Sales communication platform', category: 'crm', authType: 'api_key' },

    // Support & Feedback
    { id: 'intercom', name: 'Intercom', icon: '💬', description: 'Customer messaging platform', category: 'support', authType: 'oauth', recommended: true },
    { id: 'zendesk', name: 'Zendesk', icon: '🎧', description: 'Customer service software', category: 'support', authType: 'oauth' },
    { id: 'typeform', name: 'Typeform', icon: '📝', description: 'Surveys and forms', category: 'support', authType: 'oauth' },
    { id: 'canny', name: 'Canny', icon: '💡', description: 'Product feedback management', category: 'support', authType: 'api_key' },
]

export const CATEGORIES = [
    { id: 'analytics', label: 'Analytics & Product Intelligence' },
    { id: 'payments', label: 'Payments & Revenue' },
    { id: 'crm', label: 'CRM & Sales' },
    { id: 'support', label: 'Support & Feedback' },
]

// =================== CONNECTION FUNCTIONS ===================

/**
 * Get all connected integrations for current user
 */
export async function getConnectedIntegrations(): Promise<IntegrationStatus[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('integration_tokens')
        .select('provider, status, created_at')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching integrations:', error)
        return []
    }

    return (data || []).map(row => ({
        provider: row.provider,
        connected: row.status === 'connected',
        connectedAt: row.created_at,
        status: row.status as IntegrationStatus['status']
    }))
}

/**
 * Connect an integration using API key
 */
export async function connectWithApiKey(
    provider: string,
    apiKey: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    // Validate the API key by making a test call
    const isValid = await validateApiKey(provider, apiKey)
    if (!isValid) {
        return { success: false, error: 'Invalid API key' }
    }

    const { error } = await supabase
        .from('integration_tokens')
        .upsert({
            user_id: user.id,
            provider,
            access_token: apiKey,
            status: 'connected',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,provider'
        })

    if (error) {
        console.error('Error saving integration:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Initiate OAuth flow for an integration
 */
export function initiateOAuth(provider: string): void {
    const redirectUri = `${window.location.origin}/api/integrations/callback`

    const oauthUrls: Record<string, string> = {
        'google-analytics': `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=${provider}`,
        'hubspot': `https://app.hubspot.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID}&redirect_uri=${redirectUri}&scope=contacts%20crm.objects.contacts.read&state=${provider}`,
        'stripe': `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_only&state=${provider}&redirect_uri=${redirectUri}`,
        'intercom': `https://app.intercom.com/oauth?client_id=${process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID}&redirect_uri=${redirectUri}&state=${provider}`,
        'salesforce': `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID}&redirect_uri=${redirectUri}&state=${provider}`,
        'zendesk': `https://${process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN}.zendesk.com/oauth/authorizations/new?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZENDESK_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read&state=${provider}`,
        'typeform': `https://api.typeform.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_TYPEFORM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=responses:read&state=${provider}`,
    }

    const url = oauthUrls[provider]
    if (url) {
        window.location.href = url
    } else {
        console.error(`OAuth not configured for ${provider}`)
    }
}

/**
 * Disconnect an integration
 */
export async function disconnect(
    provider: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('integration_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', provider)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// =================== DATA SYNC ===================

/**
 * Sync data from an integration
 */
export async function syncIntegration(provider: string): Promise<SyncResult> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { provider, success: false, error: 'Not authenticated', syncedAt: new Date().toISOString() }
    }

    // Get the integration token
    const { data: token } = await supabase
        .from('integration_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single()

    if (!token) {
        return { provider, success: false, error: 'Integration not connected', syncedAt: new Date().toISOString() }
    }

    // Call the sync edge function
    try {
        const response = await fetch('/api/integrations/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, accessToken: token.access_token })
        })

        const result = await response.json()

        return {
            provider,
            success: result.success,
            recordsProcessed: result.recordsProcessed,
            error: result.error,
            syncedAt: new Date().toISOString()
        }
    } catch (error) {
        return {
            provider,
            success: false,
            error: error instanceof Error ? error.message : 'Sync failed',
            syncedAt: new Date().toISOString()
        }
    }
}

/**
 * Sync all connected integrations
 */
export async function syncAllIntegrations(): Promise<SyncResult[]> {
    const connected = await getConnectedIntegrations()
    const results = await Promise.all(
        connected.filter(i => i.connected).map(i => syncIntegration(i.provider))
    )
    return results
}

// =================== HELPERS ===================

async function validateApiKey(provider: string, apiKey: string): Promise<boolean> {
    // In production, make actual API calls to validate
    // For now, just check if the key is non-empty
    if (!apiKey || apiKey.length < 10) return false

    // Provider-specific validation endpoints
    const validationEndpoints: Record<string, string> = {
        'mixpanel': 'https://mixpanel.com/api/2.0/jql',
        'stripe': 'https://api.stripe.com/v1/balance',
        'hubspot': 'https://api.hubapi.com/crm/v3/objects/contacts',
    }

    // TODO: Implement actual validation
    return true
}

export function getIntegrationByProvider(provider: string): Integration | undefined {
    return INTEGRATIONS.find(i => i.id === provider)
}

export function getIntegrationsByCategory(category: string): Integration[] {
    return INTEGRATIONS.filter(i => i.category === category)
}
