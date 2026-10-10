/**
 * Velodesk Integrations Module
 * Handles OAuth connections and data sync with external services
 */

import { createClient } from '@/lib/supabase/client'

// =================== TYPES ===================

export type IntegrationCategory = 'analytics' | 'payments' | 'finance' | 'crm' | 'support' | 'sentiment'

export interface CredentialField {
    key: string
    label: string
    /** One line: where to find this value (from the provider's docs) */
    help: string
    secret?: boolean
    /** Defaults to true */
    required?: boolean
    placeholder?: string
    options?: { value: string; label: string }[]
}

export interface Integration {
    id: string
    name: string
    icon: string
    logo?: string
    description: string
    category: IntegrationCategory
    /** How the customer connects: OAuth via /api/integrations/oauth-start, or credentials via /api/integrations/save */
    authType: 'oauth' | 'api_key'
    recommended?: boolean
    /** Can be connected and synced today (src/lib/integrations/registry.ts has a module) */
    syncSupported: boolean
    /** Its real data feeds the PMF Score (POST /api/pmf/calculate) */
    feedsScore: boolean
    /** PMF signals it feeds, for display */
    signals?: string[]
    /** Fields the connect modal asks for (api_key providers). Stored as JSON server-side. */
    credentialFields?: CredentialField[]
    /** Why it can't be connected yet (syncSupported: false) */
    unsupportedReason?: string
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

/**
 * SINGLE SOURCE OF TRUTH for integrations (UI list + connect modal, save/OAuth
 * validation, sync, scoring). Server modules live in src/lib/integrations/registry.ts.
 * syncSupported: real validate + sync exist. feedsScore: its data is used in the PMF Score.
 */
export const INTEGRATIONS: Integration[] = [
    // Analytics & Product Intelligence
    {
        id: 'mixpanel', name: 'Mixpanel', description: 'Product analytics and user behavior tracking', category: 'analytics', icon: '◉', logo: '/mixpanel.svg', authType: 'api_key', recommended: true, syncSupported: true, feedsScore: true, signals: ['Retention'],
        credentialFields: [
            { key: 'projectId', label: 'Project ID', help: 'Project Settings → Overview → Project ID.', placeholder: '4031683' },
            { key: 'username', label: 'Service account username', help: 'Organization Settings → Service Accounts; give it access to this project.' },
            { key: 'secret', label: 'Service account secret', help: 'Shown once when you create the service account.', secret: true },
            { key: 'region', label: 'Data residency', help: 'EU or India only if your project uses Mixpanel data residency.', options: [
                { value: 'us', label: 'US (default)' },
                { value: 'eu', label: 'EU' },
                { value: 'in', label: 'India' },
            ] },
        ],
    },
    {
        id: 'amplitude', name: 'Amplitude', description: 'Digital analytics and product intelligence', category: 'analytics', icon: '⚡', logo: '/amplitude-color_v1.png', authType: 'api_key', recommended: true, syncSupported: true, feedsScore: true, signals: ['Retention', 'Engagement'],
        credentialFields: [
            { key: 'apiKey', label: 'API key', help: 'Settings → Organization settings → Projects → your project → API Key.' },
            { key: 'secretKey', label: 'Secret key', help: 'Same project page, under Secret Key.', secret: true },
            { key: 'region', label: 'Data region', help: 'Choose EU if your Amplitude org is hosted in the EU.', options: [
                { value: 'us', label: 'US (default)' },
                { value: 'eu', label: 'EU data residency' },
            ] },
        ],
    },
    {
        id: 'posthog', name: 'PostHog', description: 'Product analytics and feature flags', category: 'analytics', icon: '🏠', logo: '/logo-posthog-1.jpg', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Retention', 'Engagement'],
        credentialFields: [
            { key: 'personalApiKey', label: 'Personal API key', help: 'Account settings → Personal API keys → create a key with the "Query Read" scope.', secret: true, placeholder: 'phx_...' },
            { key: 'projectId', label: 'Project ID', help: 'Project settings → General → Project ID.' },
            { key: 'host', label: 'PostHog Cloud region', help: 'The address you log in at: us.posthog.com or eu.posthog.com (self-hosted PostHog is not supported).', options: [
                { value: 'https://us.posthog.com', label: 'US Cloud (us.posthog.com)' },
                { value: 'https://eu.posthog.com', label: 'EU Cloud (eu.posthog.com)' },
            ] },
        ],
    },
    { id: 'google-analytics', name: 'Google Analytics', description: 'Traffic and acquisition data', category: 'analytics', icon: '📊', logo: '/google-analytics-4.svg', authType: 'oauth', syncSupported: false, feedsScore: false, unsupportedReason: 'Requires an OAuth app; coming soon' },
    { id: 'segment', name: 'Segment', description: 'Customer data platform', category: 'analytics', icon: '⚙️', logo: '/segment-1.svg', authType: 'api_key', syncSupported: false, feedsScore: false, unsupportedReason: 'Segment routes events but its public API has no metrics to read; connect the analytics tool Segment sends to.' },
    { id: 'hotjar', name: 'Hotjar', description: 'Heatmaps and session recordings', category: 'analytics', icon: '🔥', logo: '/hotjar-2.svg', authType: 'api_key', syncSupported: false, feedsScore: false, unsupportedReason: 'Hotjar\'s API exposes survey responses and user lookups, not usage metrics.' },
    { id: 'heap', name: 'Heap', description: 'Auto-capture analytics', category: 'analytics', icon: '📈', logo: '/Heap_Logo_Horizontal-Color_RGB.webp', authType: 'api_key', syncSupported: false, feedsScore: false, unsupportedReason: 'Heap\'s public APIs only send data; reading metrics needs Heap Connect (a data warehouse), not an API key.' },
    { id: 'fullstory', name: 'FullStory', description: 'Digital experience intelligence', category: 'analytics', icon: '🎥', logo: '/trakop-founded-by-ravi-garg-website-integrations-marketing-automation-fullstory-logo.png', authType: 'api_key', syncSupported: false, feedsScore: false, unsupportedReason: 'FullStory\'s Server API has no aggregate usage metrics, only per-user/session lookups and enterprise data export.' },

    // Payments & Revenue
    { id: 'stripe', name: 'Stripe', description: 'Payment processing and billing', category: 'payments', icon: '💳', authType: 'oauth', recommended: true, syncSupported: true, feedsScore: true, signals: ['Revenue', 'Retention (churn)'] },
    {
        id: 'paystack', name: 'Paystack', description: 'African payments infrastructure', category: 'payments', icon: '💰', logo: '/paystack-2.svg', authType: 'api_key', recommended: true, syncSupported: true, feedsScore: true, signals: ['Revenue', 'Retention (churn)'],
        credentialFields: [
            { key: 'secretKey', label: 'Secret key', help: 'Paystack Dashboard → Settings → API Keys & Webhooks → Secret Key (sk_live_...).', secret: true, placeholder: 'sk_live_...' },
        ],
    },
    {
        id: 'chargebee', name: 'Chargebee', description: 'Subscription management', category: 'payments', icon: '🐝', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Revenue', 'Retention (churn)'],
        credentialFields: [
            { key: 'site', label: 'Site', help: 'The subdomain of your Chargebee URL: "acme" in acme.chargebee.com.', placeholder: 'acme' },
            { key: 'apiKey', label: 'API key', help: 'Settings → Configure Chargebee → API Keys and Webhooks → create a read-only key.', secret: true },
        ],
    },
    {
        id: 'paddle', name: 'Paddle', description: 'SaaS billing and tax compliance', category: 'payments', icon: '🏓', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Revenue', 'Retention (churn)'],
        credentialFields: [
            { key: 'apiKey', label: 'API key', help: 'Paddle → Developer tools → Authentication → API keys; grant subscription.read.', secret: true, placeholder: 'pdl_live_apikey_...' },
            { key: 'environment', label: 'Environment', help: 'Live for real customers; Sandbox for test accounts.', options: [
                { value: 'live', label: 'Live' },
                { value: 'sandbox', label: 'Sandbox' },
            ] },
        ],
    },

    // CRM & Sales
    {
        id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing automation', category: 'crm', icon: '🟠', logo: '/hubspot.svg', authType: 'api_key', recommended: true, syncSupported: true, feedsScore: true, signals: ['Growth (deals won)'],
        credentialFields: [
            { key: 'accessToken', label: 'Private app access token', help: 'Settings → Integrations → Private Apps → create an app with crm.objects.deals.read and crm.objects.contacts.read.', secret: true, placeholder: 'pat-...' },
        ],
    },
    {
        id: 'pipedrive', name: 'Pipedrive', description: 'Sales pipeline management', category: 'crm', icon: '🎯', logo: '/pipedrive.svg', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Growth (deals won)'],
        credentialFields: [
            { key: 'apiToken', label: 'API token', help: 'Profile menu → Personal preferences → API → Your personal API token.', secret: true },
        ],
    },
    {
        id: 'close', name: 'Close', description: 'Sales engagement CRM', category: 'crm', icon: '📞', logo: '/close.svg', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Growth (opportunities won)'],
        credentialFields: [
            { key: 'apiKey', label: 'API key', help: 'Settings → Developer → API Keys → New API Key.', secret: true, placeholder: 'api_...' },
        ],
    },
    { id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM platform', category: 'crm', icon: '☁️', logo: '/salesforce-2.svg', authType: 'oauth', syncSupported: false, feedsScore: false, unsupportedReason: 'Requires an OAuth app; coming soon' },

    // Accounting & Spend Management
    { id: 'quickbooks', name: 'QuickBooks', description: 'Cloud accounting and bookkeeping', category: 'finance', icon: 'Q', authType: 'oauth', syncSupported: false, feedsScore: false, unsupportedReason: 'Requires an OAuth app; coming soon' },
    { id: 'xero', name: 'Xero', description: 'Online accounting software', category: 'finance', icon: 'X', authType: 'oauth', syncSupported: false, feedsScore: false, unsupportedReason: 'Requires an OAuth app; coming soon' },
    { id: 'ramp', name: 'Ramp', description: 'Corporate cards and spend management', category: 'finance', icon: 'R', authType: 'oauth', syncSupported: false, feedsScore: false, unsupportedReason: 'Requires an OAuth app; coming soon' },

    // Support & Feedback
    {
        id: 'intercom', name: 'Intercom', description: 'Customer messaging platform', category: 'support', icon: '💬', logo: '/intercom-2.svg', authType: 'api_key', recommended: true, syncSupported: true, feedsScore: true, signals: ['Satisfaction (CSAT)'],
        credentialFields: [
            { key: 'accessToken', label: 'Access token', help: 'Developer Hub → your app → Configure → Authentication → Access token.', secret: true },
            { key: 'region', label: 'Workspace region', help: 'Choose EU or Australia if your Intercom workspace is hosted there.', options: [
                { value: 'us', label: 'US (default)' },
                { value: 'eu', label: 'EU' },
                { value: 'au', label: 'Australia' },
            ] },
        ],
    },
    {
        id: 'zendesk', name: 'Zendesk', description: 'Customer service and support', category: 'support', icon: '🎧', logo: '/zendesk-1.svg', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Satisfaction (CSAT)'],
        credentialFields: [
            { key: 'subdomain', label: 'Subdomain', help: '"acme" in acme.zendesk.com.', placeholder: 'acme' },
            { key: 'email', label: 'Agent email', help: 'Email address of the admin or agent who owns the API token.' },
            { key: 'apiToken', label: 'API token', help: 'Admin Center → Apps and integrations → APIs → Zendesk API → Settings → Add API token.', secret: true },
        ],
    },
    {
        id: 'typeform', name: 'Typeform', description: 'Forms and surveys', category: 'support', icon: '📝', logo: '/typeform.svg', authType: 'api_key', syncSupported: true, feedsScore: true, signals: ['Satisfaction (NPS)'],
        credentialFields: [
            { key: 'token', label: 'Personal access token', help: 'Account → Your settings → Personal tokens → generate with forms:read and responses:read.', secret: true, placeholder: 'tfp_...' },
            { key: 'formId', label: 'Form ID', help: 'The code after /to/ in your form link (e.g. abc123 in form.typeform.com/to/abc123).' },
            { key: 'fieldId', label: 'NPS question ID', help: 'Leave blank and click Connect: we will list the 0-10 questions on that form to choose from.', required: false },
        ],
    },
    {
        id: 'canny', name: 'Canny', description: 'Feature request tracking', category: 'support', icon: '📣', logo: '/Canny_logo.png', authType: 'api_key', syncSupported: true, feedsScore: false, signals: [],
        credentialFields: [
            { key: 'apiKey', label: 'API secret key', help: 'Settings → API & Webhooks → API Secret Key.', secret: true },
        ],
    },

    // Customer Sentiment & Reviews
    { id: 'trustpilot', name: 'Trustpilot', description: 'B2B reviews and qualitative sentiment data', category: 'sentiment', icon: '⭐', authType: 'api_key', syncSupported: false, feedsScore: false, unsupportedReason: 'Reading private review data needs an approved Trustpilot Business API (OAuth) app.' },
]

export const CATEGORIES: { id: IntegrationCategory; label: string }[] = [
    { id: 'analytics', label: 'Analytics & Product Intelligence' },
    { id: 'payments', label: 'Payments & Revenue' },
    { id: 'finance', label: 'Accounting & Spend Management' },
    { id: 'crm', label: 'CRM & Sales' },
    { id: 'support', label: 'Support & Feedback' },
    { id: 'sentiment', label: 'Customer Sentiment & Reviews' },
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

    // Secrets are written server-side (session-scoped, plan limits enforced)
    const response = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, accessToken: apiKey }),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
        return { success: false, error: result.error || 'Failed to save integration' }
    }

    return { success: true }
}

/**
 * Initiate OAuth flow for an integration
 */
export function initiateOAuth(provider: string): void {
    // The server builds the provider URL and sets the CSRF state cookie
    window.location.href = `/api/integrations/oauth-start?provider=${encodeURIComponent(provider)}`
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

    // Check the integration exists (the token itself never leaves the server)
    const { data: token } = await supabase
        .from('integration_tokens')
        .select('provider')
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
            body: JSON.stringify({ provider })
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
