'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'

interface Integration {
    id: string
    name: string
    description: string
    category: string
    icon: string
    logo?: string
    authType: 'oauth' | 'api_key'
    recommended?: boolean
}

const integrations: Integration[] = [
    // Analytics & Product
    { id: 'mixpanel', name: 'Mixpanel', description: 'Product analytics and user behavior tracking', category: 'analytics', icon: '◉', logo: '/mixpanel.svg', authType: 'api_key', recommended: true },
    { id: 'amplitude', name: 'Amplitude', description: 'Digital analytics and product intelligence', category: 'analytics', icon: '⚡', logo: '/amplitude-color_v1.png', authType: 'api_key', recommended: true },
    { id: 'google-analytics', name: 'Google Analytics', description: 'Traffic and acquisition data', category: 'analytics', icon: '📊', logo: '/google-analytics-4.svg', authType: 'oauth' },
    { id: 'segment', name: 'Segment', description: 'Customer data platform', category: 'analytics', icon: '⚙️', logo: '/segment-1.svg', authType: 'api_key' },
    { id: 'hotjar', name: 'Hotjar', description: 'Heatmaps and session recordings', category: 'analytics', icon: '🔥', logo: '/hotjar-2.svg', authType: 'api_key' },
    { id: 'posthog', name: 'PostHog', description: 'Product analytics and feature flags', category: 'analytics', icon: '🏠', logo: '/logo-posthog-1.jpg', authType: 'api_key' },
    { id: 'heap', name: 'Heap', description: 'Auto-capture analytics', category: 'analytics', icon: '📈', logo: '/Heap_Logo_Horizontal-Color_RGB.webp', authType: 'api_key' },
    { id: 'fullstory', name: 'FullStory', description: 'Digital experience intelligence', category: 'analytics', icon: '🎥', logo: '/trakop-founded-by-ravi-garg-website-integrations-marketing-automation-fullstory-logo.png', authType: 'api_key' },

    // Payments & Revenue
    { id: 'stripe', name: 'Stripe', description: 'Payment processing and billing', category: 'payments', icon: '💳', authType: 'oauth', recommended: true },
    { id: 'paystack', name: 'Paystack', description: 'African payments infrastructure', category: 'payments', icon: '💰', logo: '/paystack-2.svg', authType: 'api_key' },
    { id: 'paddle', name: 'Paddle', description: 'SaaS billing and tax compliance', category: 'payments', icon: '🏓', authType: 'api_key' },
    { id: 'chargebee', name: 'Chargebee', description: 'Subscription management', category: 'payments', icon: '🐝', authType: 'api_key' },

    // CRM & Sales
    { id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing automation', category: 'crm', icon: '🟠', logo: '/hubspot.svg', authType: 'api_key', recommended: true },
    { id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM platform', category: 'crm', icon: '☁️', logo: '/salesforce-2.svg', authType: 'oauth' },
    { id: 'pipedrive', name: 'Pipedrive', description: 'Sales pipeline management', category: 'crm', icon: '🎯', logo: '/pipedrive.svg', authType: 'api_key' },
    { id: 'close', name: 'Close', description: 'Sales engagement CRM', category: 'crm', icon: '📞', logo: '/close.svg', authType: 'api_key' },

    // Support & Feedback
    { id: 'intercom', name: 'Intercom', description: 'Customer messaging platform', category: 'support', icon: '💬', logo: '/intercom-2.svg', authType: 'oauth', recommended: true },
    { id: 'zendesk', name: 'Zendesk', description: 'Customer service and support', category: 'support', icon: '🎧', logo: '/zendesk-1.svg', authType: 'oauth' },
    { id: 'typeform', name: 'Typeform', description: 'Forms and surveys', category: 'support', icon: '📝', logo: '/typeform.svg', authType: 'oauth' },
    { id: 'canny', name: 'Canny', description: 'Feature request tracking', category: 'support', icon: '📣', logo: '/Canny_logo.png', authType: 'api_key' },

    // Sentiment & Reviews
    { id: 'trustpilot', name: 'Trustpilot', description: 'B2B reviews and qualitative sentiment data', category: 'sentiment', icon: '⭐', authType: 'api_key', recommended: true },
]

const categories = [
    { id: 'analytics', label: 'Analytics & Product Intelligence' },
    { id: 'payments', label: 'Payments & Revenue' },
    { id: 'crm', label: 'CRM & Sales' },
    { id: 'support', label: 'Support & Feedback' },
    { id: 'sentiment', label: 'Customer Sentiment & Reviews' },
]

// OAuth URLs for each provider
const oauthUrls: Record<string, string> = {
    'google-analytics': `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=google-analytics`,
    'hubspot': `https://app.hubspot.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&scope=contacts%20crm.objects.contacts.read&state=hubspot`,
    'stripe': `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_only&state=stripe`,
    'intercom': `https://app.intercom.com/oauth?client_id=${process.env.NEXT_PUBLIC_INTERCOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&state=intercom`,
    'salesforce': `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&state=salesforce`,
    'zendesk': `https://${process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN || 'your-subdomain'}.zendesk.com/oauth/authorizations/new?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZENDESK_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&scope=read&state=zendesk`,
    'typeform': `https://api.typeform.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_TYPEFORM_CLIENT_ID}&redirect_uri=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/api/integrations/callback&scope=responses:read&state=typeform`,
}

export default function IntegrationsPage() {
    const searchParams = useSearchParams()
    const [connectedIds, setConnectedIds] = useState<string[]>([])
    const [connecting, setConnecting] = useState<string | null>(null)
    const [apiKeyModal, setApiKeyModal] = useState<Integration | null>(null)
    const [apiKeyInput, setApiKeyInput] = useState('')
    const [mixpanelCreds, setMixpanelCreds] = useState({ projectId: '', username: '', secret: '' })
    const [amplitudeCreds, setAmplitudeCreds] = useState({ apiKey: '', secretKey: '' })
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Load connected integrations on mount
    useEffect(() => {
        loadConnectedIntegrations()
    }, [])

    // Check for OAuth callback success/error
    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success) {
            setNotification({ type: 'success', message: `Successfully connected ${success}!` })
            loadConnectedIntegrations()
            // Clear URL params
            window.history.replaceState({}, '', '/dashboard/integrations')
        } else if (error) {
            setNotification({ type: 'error', message: `Failed to connect: ${error}` })
            window.history.replaceState({}, '', '/dashboard/integrations')
        }
    }, [searchParams])

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    async function loadConnectedIntegrations() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
            .from('integration_tokens')
            .select('provider')
            .eq('user_id', user.id)
            .eq('status', 'connected')

        if (data) {
            setConnectedIds(data.map(d => d.provider))
        }
    }

    const handleConnect = async (integration: Integration) => {
        if (integration.authType === 'oauth') {
            // Redirect to OAuth flow
            const url = oauthUrls[integration.id]
            if (url) {
                window.location.href = url
            } else {
                setNotification({ type: 'error', message: `OAuth not configured for ${integration.name}` })
            }
        } else {
            // Show API key modal
            setApiKeyModal(integration)
            setApiKeyInput('')
        }
    }

    const handleDisconnect = async (integrationId: string) => {
        setConnecting(integrationId)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setConnecting(null)
            return
        }

        const { error } = await supabase
            .from('integration_tokens')
            .delete()
            .eq('user_id', user.id)
            .eq('provider', integrationId)

        if (error) {
            setNotification({ type: 'error', message: 'Failed to disconnect integration' })
        } else {
            setConnectedIds(connectedIds.filter(id => id !== integrationId))
            setNotification({ type: 'success', message: 'Integration disconnected' })
        }

        setConnecting(null)
    }

    const handleApiKeySubmit = async () => {
        if (!apiKeyModal) return

        let tokenToSave = apiKeyInput;

        if (apiKeyModal.id === 'mixpanel') {
            if (!mixpanelCreds.projectId || !mixpanelCreds.username || !mixpanelCreds.secret) return;
            tokenToSave = JSON.stringify(mixpanelCreds);
        } else if (apiKeyModal.id === 'amplitude') {
            if (!amplitudeCreds.apiKey || !amplitudeCreds.secretKey) return;
            tokenToSave = JSON.stringify(amplitudeCreds);
        } else {
            if (!apiKeyInput.trim()) return;
        }

        setConnecting(apiKeyModal.id)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setConnecting(null)
            return
        }

        // Save API key via backend API to bypass RLS
        try {
            const res = await fetch('/api/integrations/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    provider: apiKeyModal.id,
                    accessToken: tokenToSave
                })
            })

            const data = await res.json()

            if (!res.ok) {
                console.error("Failed to save API key:", data.error)
                setNotification({ type: 'error', message: `Failed to save API key: ${data.error || 'Unknown error'}` })
            } else {
                setConnectedIds([...connectedIds, apiKeyModal.id])
                setNotification({ type: 'success', message: `Connected to ${apiKeyModal.name}!` })
            }
        } catch (err: any) {
            console.error("Network error saving API key:", err)
            setNotification({ type: 'error', message: `Network error: ${err.message}` })
        }

        setApiKeyModal(null)
        setApiKeyInput('')
        setMixpanelCreds({ projectId: '', username: '', secret: '' })
        setAmplitudeCreds({ apiKey: '', secretKey: '' })
        setConnecting(null)
    }

    return (
        <div>
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* API Key Modal */}
            {apiKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-xl p-8 max-w-md w-full mx-4">
                        <h3 className="font-outfit text-xl font-light mb-2">
                            Connect {apiKeyModal.name}
                        </h3>
                        <p className="text-[#606060] text-sm mb-6">
                            Enter your API key to connect {apiKeyModal.name} to Velodesk.
                        </p>

                        {apiKeyModal.id === 'mixpanel' ? (
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    value={mixpanelCreds.projectId}
                                    onChange={(e) => setMixpanelCreds({ ...mixpanelCreds, projectId: e.target.value })}
                                    placeholder="Project ID (e.g. 4031683)"
                                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                                />
                                <input
                                    type="text"
                                    value={mixpanelCreds.username}
                                    onChange={(e) => setMixpanelCreds({ ...mixpanelCreds, username: e.target.value })}
                                    placeholder="Service Account Username"
                                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                                />
                                <input
                                    type="password"
                                    value={mixpanelCreds.secret}
                                    onChange={(e) => setMixpanelCreds({ ...mixpanelCreds, secret: e.target.value })}
                                    placeholder="Service Account Secret"
                                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                                />
                            </div>
                        ) : apiKeyModal.id === 'amplitude' ? (
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    value={amplitudeCreds.apiKey}
                                    onChange={(e) => setAmplitudeCreds({ ...amplitudeCreds, apiKey: e.target.value })}
                                    placeholder="Amplitude API Key"
                                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                                />
                                <input
                                    type="password"
                                    value={amplitudeCreds.secretKey}
                                    onChange={(e) => setAmplitudeCreds({ ...amplitudeCreds, secretKey: e.target.value })}
                                    placeholder="Amplitude Secret Key"
                                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                                />
                            </div>
                        ) : (
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="Enter API key..."
                                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#606060] focus:outline-none focus:border-[rgba(255,255,255,0.2)] mb-6"
                                aria-label={`API key for ${apiKeyModal.name}`}
                            />
                        )}

                        <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded p-4 mb-6 text-[11px] text-[#808080] leading-relaxed">
                            <span className="text-white/90 font-medium block mb-1">You're in control.</span>
                            VeloDesk always respects your data preferences, and is limited to the specific read-only permissions you've explicitly granted during integration.<br/><br/>
                            <span className="text-white/90 font-medium block mb-1">Data shared during integration.</span>
                            By connecting {apiKeyModal.name}, you allow VeloDesk to securely access: (1) basic account information, and (2) a real-time stream of product and revenue events necessary to calculate your PMF Score. Our policies require that VeloDesk only reads relevant content required to generate your signals. We guarantee that your data is strictly used for calculating your PMF score and is never shared, trained on, or monetized. This data will be used as described in the Crelligent <Link href="#" className="text-white/70 hover:text-white underline decoration-white/30">Terms of Use</Link> and <Link href="#" className="text-white/70 hover:text-white underline decoration-white/30">Privacy Notice</Link>.
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setApiKeyModal(null)}
                                className="flex-1 px-4 py-3 border border-[rgba(255,255,255,0.1)] text-[#606060] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApiKeySubmit}
                                disabled={
                                    connecting === apiKeyModal.id || 
                                    (apiKeyModal.id === 'mixpanel' 
                                        ? (!mixpanelCreds.projectId || !mixpanelCreds.username || !mixpanelCreds.secret)
                                        : apiKeyModal.id === 'amplitude'
                                        ? (!amplitudeCreds.apiKey || !amplitudeCreds.secretKey)
                                        : !apiKeyInput.trim())
                                }
                                className="flex-1 px-4 py-3 bg-white text-black font-medium hover:bg-gray-100 transition rounded-lg disabled:opacity-50"
                            >
                                {connecting === apiKeyModal.id ? 'Connecting...' : 'Connect'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-12">
                <div>
                    <div className="text-[0.65rem] text-[#404040] uppercase tracking-[0.3em] mb-4">Data Sources</div>
                    <h1 className="font-outfit text-[2.5rem] font-extralight tracking-tight mb-4">
                        Connect your integrations
                    </h1>
                    <p className="text-[#606060] text-[1.1rem] font-light leading-relaxed max-w-xl mb-6">
                        Link your existing tools to feed real-time signals into our validation engine.
                    </p>
                    
                    {/* Data Integrity Note */}
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-4 max-w-xl">
                        <div className="mt-0.5">
                            <Shield className="w-4 h-4 text-[#7B61FF]" />
                        </div>
                        <div>
                            <div className="text-sm text-white/90 font-medium mb-1">Strict Data Integrity Enforced</div>
                            <div className="text-xs text-[#606060] leading-relaxed">
                                Incoming data streams are secured via OAuth 2.0 and processed using cryptographic idempotency keys. Duplicate webhooks are automatically rejected at the database level to mathematically guarantee zero double-counting. <strong>VeloDesk guarantees that your data is strictly used for calculating your PMF score and is never shared, trained on, or monetized.</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 text-[0.7rem] text-[#404040] uppercase tracking-[0.15em]">
                    <span className={`w-[6px] h-[6px] rounded-full ${connectedIds.length > 0 ? 'bg-green-500' : 'bg-[#404040]'}`} />
                    {connectedIds.length} connected
                </div>
            </div>

            {/* Categories */}
            {categories.map((category) => {
                const categoryIntegrations = integrations.filter(i => i.category === category.id)

                return (
                    <div key={category.id} className="mb-12">
                        <div className="text-[0.6rem] text-[#404040] uppercase tracking-[0.25em] pb-6 mb-6 border-b border-[rgba(255,255,255,0.04)]">
                            {category.label}
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {categoryIntegrations.map((integration) => {
                                const isConnected = connectedIds.includes(integration.id)
                                const isConnecting = connecting === integration.id

                                return (
                                    <div
                                        key={integration.id}
                                        className={`p-8 border transition-all relative ${isConnected
                                            ? 'border-green-500/30 bg-green-500/5'
                                            : 'border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.02)]'
                                            }`}
                                    >
                                        {integration.recommended && !isConnected && (
                                            <span className="absolute top-4 right-4 text-[0.5rem] text-[#606060] uppercase tracking-[0.1em] px-2 py-1 border border-[rgba(255,255,255,0.04)]">
                                                Recommended
                                            </span>
                                        )}

                                        {isConnected && (
                                            <span className="absolute top-4 right-4 text-[0.5rem] text-green-400 uppercase tracking-[0.1em] px-2 py-1 border border-green-500/30 bg-green-500/10">
                                                ✓ Connected
                                            </span>
                                        )}

                                        <div className="h-8 mb-6 flex items-center">
                                            {integration.logo ? (
                                                <img 
                                                    src={integration.logo} 
                                                    alt={integration.name} 
                                                    className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <span className="text-2xl opacity-80">{integration.icon}</span>
                                            )}
                                        </div>

                                        <h3 className="font-outfit text-[1.1rem] font-light tracking-wide mb-3">
                                            {integration.name}
                                        </h3>

                                        <p className="text-[0.8rem] text-[#606060] font-light leading-relaxed mb-6">
                                            {integration.description}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            {isConnected ? (
                                                <button
                                                    onClick={() => handleDisconnect(integration.id)}
                                                    disabled={isConnecting}
                                                    className="text-[0.55rem] uppercase tracking-[0.15em] text-red-400 hover:text-red-300 transition"
                                                >
                                                    {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleConnect(integration)}
                                                    disabled={isConnecting}
                                                    className="text-[0.55rem] uppercase tracking-[0.15em] text-white hover:text-green-400 transition"
                                                >
                                                    {isConnecting ? 'Connecting...' : integration.authType === 'oauth' ? 'Connect with OAuth' : 'Connect with API Key'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {/* Footer */}
            <div className="flex justify-between items-center py-12 border-t border-[rgba(255,255,255,0.04)] mt-8">
                <div className="text-[0.8rem] text-[#404040]">
                    {connectedIds.length === 0
                        ? 'No integrations connected yet'
                        : `${connectedIds.length} integration${connectedIds.length > 1 ? 's' : ''} connected`
                    }
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-outfit font-medium text-[0.8rem] uppercase tracking-[0.1em] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.1)] transition-all"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}
