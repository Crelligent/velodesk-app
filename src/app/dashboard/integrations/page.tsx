'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'
import { INTEGRATIONS, CATEGORIES, type Integration } from '@/lib/integrations'

// Provider list, auth types and sync support come from the single source of truth in
// src/lib/integrations.ts, so API-key vs OAuth always matches the save / oauth-start routes.
// The two sources a founder needs for a first PMF Score, shown together at the top.
const PRIMARY_SOURCE_IDS = ['paystack', 'stripe'] as const

const PAYSTACK_KEY_HELP =
    'In your Paystack Dashboard, go to Settings → API Keys & Webhooks and copy your live Secret Key (starts with sk_live_). Velodesk only reads your transaction and customer data; it never creates charges, transfers or refunds.'

// OAuth always starts on the server: /api/integrations/oauth-start sets a CSRF state cookie
// and redirects to the provider. No provider URLs are built in the browser.
function oauthStartUrl(providerId: string) {
    return `/api/integrations/oauth-start?provider=${encodeURIComponent(providerId)}`
}

function initialCredentials(integration: Integration): Record<string, string> {
    return Object.fromEntries(
        (integration.credentialFields ?? []).map(f => [f.key, f.options?.[0]?.value ?? ''])
    )
}

function missingRequired(integration: Integration, values: Record<string, string>): boolean {
    return (integration.credentialFields ?? []).some(f => f.required !== false && !values[f.key]?.trim())
}

export default function IntegrationsPage() {
    const searchParams = useSearchParams()
    const [connectedIds, setConnectedIds] = useState<string[]>([])
    const [connecting, setConnecting] = useState<string | null>(null)
    const [apiKeyModal, setApiKeyModal] = useState<Integration | null>(null)
    // Credential form values for the open modal, keyed by CredentialField.key
    const [credValues, setCredValues] = useState<Record<string, string>>({})
    const [modalError, setModalError] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    // Stripe OAuth confirmation: we show a clear button instead of redirecting automatically.
    const [stripePrompt, setStripePrompt] = useState(false)
    const [preferNgn, setPreferNgn] = useState(false)
    const connectParamHandled = useRef(false)

    // Load connected integrations on mount
    useEffect(() => {
        loadConnectedIntegrations()
    }, [])

    // Handle ?connect=paystack|stripe (sent from onboarding)
    useEffect(() => {
        if (connectParamHandled.current) return
        const connect = searchParams.get('connect')
        if (connect !== 'paystack' && connect !== 'stripe') return
        connectParamHandled.current = true

        if (connect === 'paystack') {
            const paystack = INTEGRATIONS.find(i => i.id === 'paystack')
            if (paystack) openKeyModal(paystack)
        } else {
            setStripePrompt(true)
        }
        window.history.replaceState({}, '', '/dashboard/integrations')
    }, [searchParams])

    // Close dialogs with Escape
    useEffect(() => {
        if (!apiKeyModal && !stripePrompt) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setApiKeyModal(null)
                setStripePrompt(false)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [apiKeyModal, stripePrompt])

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

        // Order the primary sources by the currency chosen at signup (NGN -> Paystack first)
        setPreferNgn(user.user_metadata?.selected_currency === 'NGN')

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
        if (!integration.syncSupported) return // "Coming soon" providers can't be connected
        if (integration.id === 'stripe') {
            // Confirm before leaving the site
            setStripePrompt(true)
        } else if (integration.authType === 'oauth') {
            window.location.href = oauthStartUrl(integration.id)
        } else {
            openKeyModal(integration)
        }
    }

    function openKeyModal(integration: Integration) {
        setApiKeyModal(integration)
        setCredValues(initialCredentials(integration))
        setModalError(null)
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
        if (!apiKeyModal || missingRequired(apiKeyModal, credValues)) return

        setConnecting(apiKeyModal.id)
        setModalError(null)

        // Credentials are validated against the provider and stored server-side
        try {
            const res = await fetch('/api/integrations/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: apiKeyModal.id, credentials: credValues }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                // Keep the modal open so the founder can fix the field (e.g. pick the Typeform NPS question)
                setModalError(data.error || 'Could not connect. Check the values and try again.')
                setConnecting(null)
                return
            }

            setConnectedIds(ids => ids.includes(apiKeyModal.id) ? ids : [...ids, apiKeyModal.id])
            setNotification({
                type: 'success',
                message: apiKeyModal.feedsScore
                    ? `Connected to ${apiKeyModal.name}. Your PMF Score will update in a minute.`
                    : `Connected to ${apiKeyModal.name}!`,
            })
        } catch {
            setModalError('Network error. Please try again.')
            setConnecting(null)
            return
        }

        setApiKeyModal(null)
        setCredValues({})
        setConnecting(null)
    }

    const primarySources = (preferNgn ? ['paystack', 'stripe'] : ['stripe', 'paystack'])
        .map(id => INTEGRATIONS.find(i => i.id === id))
        .filter((i): i is Integration => Boolean(i))

    const isPrimaryId = (id: string) => (PRIMARY_SOURCE_IDS as readonly string[]).includes(id)
    const otherAvailable = INTEGRATIONS.filter(i => i.syncSupported && !isPrimaryId(i.id))
    const comingSoonList = INTEGRATIONS.filter(i => !i.syncSupported && !isPrimaryId(i.id))

    const renderCard = (integration: Integration) => {
        const isConnected = connectedIds.includes(integration.id)
        const isConnecting = connecting === integration.id
        const isPrimary = (PRIMARY_SOURCE_IDS as readonly string[]).includes(integration.id)
        const comingSoon = !integration.syncSupported

        return (
            <div
                key={integration.id}
                className={`p-6 md:p-8 border transition-all relative ${isConnected
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.02)]'
                    }`}
            >
                {comingSoon && !isConnected && (
                    <span className="absolute top-4 right-4 text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.1em] px-2 py-1 border border-[rgba(255,255,255,0.12)]">
                        Coming soon
                    </span>
                )}

                {!comingSoon && (integration.recommended || isPrimary) && !isConnected && (
                    <span className="absolute top-4 right-4 text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.1em] px-2 py-1 border border-[rgba(255,255,255,0.12)]">
                        Recommended
                    </span>
                )}

                {isConnected && (
                    <span className="absolute top-4 right-4 text-[0.6rem] text-green-400 uppercase tracking-[0.1em] px-2 py-1 border border-green-500/30 bg-green-500/10">
                        ✓ Connected
                    </span>
                )}

                <div className="h-8 mb-6 flex items-center">
                    {integration.logo ? (
                        <img
                            src={integration.logo}
                            alt=""
                            className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-105"
                        />
                    ) : (
                        <span className="text-2xl opacity-80" aria-hidden="true">{integration.icon}</span>
                    )}
                </div>

                <h3 className="font-outfit text-[1.1rem] font-light tracking-wide mb-3">
                    {integration.name}
                </h3>

                <p className="text-[0.8rem] text-[#8A8A8A] font-light leading-relaxed mb-3">
                    {integration.description}
                </p>

                {!comingSoon && (
                    <p className="text-[0.75rem] text-gray-300 mb-6">
                        {integration.feedsScore
                            ? `Feeds your PMF Score${integration.signals?.length ? `: ${integration.signals.join(', ')}` : ''}.`
                            : 'Syncs data; not used in your PMF Score yet.'}
                    </p>
                )}
                {comingSoon && (
                    <p className="text-[0.75rem] text-[#8A8A8A] mb-6">{integration.unsupportedReason}</p>
                )}

                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <button
                            type="button"
                            onClick={() => handleDisconnect(integration.id)}
                            disabled={isConnecting}
                            aria-label={`Disconnect ${integration.name}`}
                            className="text-[0.7rem] uppercase tracking-[0.15em] text-red-400 hover:text-red-300 transition rounded px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                            {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                    ) : comingSoon ? (
                        <span className="text-[0.7rem] uppercase tracking-[0.15em] text-[#8A8A8A]">
                            Not available yet
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleConnect(integration)}
                            disabled={isConnecting}
                            aria-label={`Connect ${integration.name}`}
                            className={isPrimary
                                ? 'px-4 py-2 bg-white text-black text-[0.75rem] font-medium uppercase tracking-[0.1em] rounded-lg hover:bg-gray-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]'
                                : 'text-[0.7rem] uppercase tracking-[0.15em] text-white hover:text-green-400 transition rounded px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'}
                        >
                            {isConnecting
                                ? 'Connecting...'
                                : isPrimary
                                    ? `Connect ${integration.name}`
                                    : integration.authType === 'oauth' ? 'Connect with OAuth' : 'Connect with API Key'}
                        </button>
                    )}
                </div>
            </div>
        )
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
                    <div role="dialog" aria-modal="true" aria-labelledby="api-key-modal-title" className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 sm:p-8 max-w-md w-full my-auto">
                        <h2 id="api-key-modal-title" className="font-outfit text-xl font-light mb-2">
                            Connect {apiKeyModal.name}
                        </h2>
                        <p className="text-[#8A8A8A] text-sm mb-6">
                            {apiKeyModal.id === 'paystack'
                                ? PAYSTACK_KEY_HELP
                                : `Velodesk only reads data from ${apiKeyModal.name}; read-only keys are enough.`}
                        </p>

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleApiKeySubmit() }}
                            className="space-y-4 mb-6"
                            id="credentials-form"
                        >
                            {(apiKeyModal.credentialFields ?? []).map((field, index) => {
                                const inputId = `cred-${apiKeyModal.id}-${field.key}`
                                const helpId = `${inputId}-help`
                                const inputClass = 'w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[rgba(255,255,255,0.4)] focus-visible:ring-2 focus-visible:ring-white/60'
                                return (
                                    <div key={field.key}>
                                        <label htmlFor={inputId} className="block text-xs text-white/80 mb-1">
                                            {field.label}{field.required === false ? ' (optional)' : ''}
                                        </label>
                                        {field.options ? (
                                            <select
                                                id={inputId}
                                                aria-describedby={helpId}
                                                value={credValues[field.key] ?? ''}
                                                onChange={(e) => setCredValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                className={inputClass}
                                            >
                                                {field.options.map(o => (
                                                    <option key={o.value} value={o.value} className="bg-[#0a0a0a]">{o.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                id={inputId}
                                                type={field.secret ? 'password' : 'text'}
                                                autoFocus={index === 0}
                                                autoComplete="off"
                                                spellCheck={false}
                                                aria-describedby={helpId}
                                                value={credValues[field.key] ?? ''}
                                                onChange={(e) => setCredValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className={inputClass}
                                            />
                                        )}
                                        <p id={helpId} className="mt-1 text-[11px] text-[#8A8A8A] leading-snug">{field.help}</p>
                                    </div>
                                )
                            })}
                        </form>

                        {modalError && (
                            <p role="alert" className="mb-6 text-sm text-red-400 break-words">{modalError}</p>
                        )}

                        <div className="bg-[#050505] border border-[rgba(255,255,255,0.05)] rounded p-4 mb-6 text-[11px] text-[#8A8A8A] leading-relaxed">
                            <span className="text-white/90 font-medium block mb-1">You're in control.</span>
                            VeloDesk always respects your data preferences, and is limited to the specific read-only permissions you've explicitly granted during integration.<br/><br/>
                            <span className="text-white/90 font-medium block mb-1">Data shared during integration.</span>
                            By connecting {apiKeyModal.name}, you allow VeloDesk to securely access: (1) basic account information, and (2) a real-time stream of product and revenue events necessary to calculate your PMF Score. Our policies require that VeloDesk only reads relevant content required to generate your signals. We guarantee that your data is strictly used for calculating your PMF score and is never shared, trained on, or monetized. This data will be used as described in the Crelligent <Link href="#" className="text-white/70 hover:text-white underline decoration-white/30">Terms of Use</Link> and <Link href="#" className="text-white/70 hover:text-white underline decoration-white/30">Privacy Notice</Link>.
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => { setApiKeyModal(null); setModalError(null) }}
                                className="flex-1 px-4 py-3 border border-[rgba(255,255,255,0.1)] text-[#8A8A8A] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="credentials-form"
                                disabled={connecting === apiKeyModal.id || missingRequired(apiKeyModal, credValues)}
                                className="flex-1 px-4 py-3 bg-white text-black font-medium hover:bg-gray-100 transition rounded-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            >
                                {connecting === apiKeyModal.id ? 'Connecting...' : 'Connect'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stripe OAuth confirmation */}
            {stripePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="stripe-modal-title" className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 sm:p-8 max-w-md w-full">
                        <h2 id="stripe-modal-title" className="font-outfit text-xl font-light mb-2">
                            Connect Stripe
                        </h2>
                        <p className="text-[#8A8A8A] text-sm mb-6 leading-relaxed">
                            You&apos;ll leave Velodesk and go to Stripe to approve read-only access to your
                            account. Stripe will send you back here when you&apos;re done.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => setStripePrompt(false)}
                                className="flex-1 px-4 py-3 border border-[rgba(255,255,255,0.1)] text-[#8A8A8A] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                Cancel
                            </button>
                            <a
                                href={oauthStartUrl('stripe')}
                                autoFocus
                                className="flex-1 px-4 py-3 bg-white text-black text-center font-medium hover:bg-gray-100 transition rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            >
                                Continue to Stripe
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div>
                    <div className="text-[0.65rem] text-[#8A8A8A] uppercase tracking-[0.3em] mb-4">Data Sources</div>
                    <h1 className="font-outfit text-[2.5rem] font-extralight tracking-tight mb-4">
                        Connect your integrations
                    </h1>
                    <p className="text-[#8A8A8A] text-[1.1rem] font-light leading-relaxed max-w-xl mb-6">
                        Link your existing tools to feed real-time signals into our validation engine.
                    </p>
                    
                    {/* Data Integrity Note */}
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-4 max-w-xl">
                        <div className="mt-0.5">
                            <Shield className="w-4 h-4 text-[#7B61FF]" />
                        </div>
                        <div>
                            <div className="text-sm text-white/90 font-medium mb-1">Strict Data Integrity Enforced</div>
                            <div className="text-xs text-[#8A8A8A] leading-relaxed">
                                Incoming data streams are secured via OAuth 2.0 and processed using cryptographic idempotency keys. Duplicate webhooks are automatically rejected at the database level to mathematically guarantee zero double-counting. <strong>VeloDesk guarantees that your data is strictly used for calculating your PMF score and is never shared, trained on, or monetized.</strong>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 text-[0.7rem] text-[#8A8A8A] uppercase tracking-[0.15em]">
                    <span className={`w-[6px] h-[6px] rounded-full ${connectedIds.length > 0 ? 'bg-green-500' : 'bg-[#404040]'}`} />
                    {connectedIds.length} connected
                </div>
            </div>

            {/* Recommended: the two sources needed for a first PMF Score */}
            <section aria-labelledby="primary-sources-heading" className="mb-12">
                <h2 id="primary-sources-heading" className="text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.25em] pb-6 mb-6 border-b border-[rgba(255,255,255,0.08)]">
                    Start here: connect your payments
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {primarySources.map(renderCard)}
                </div>
            </section>

            {/* Other available sources (sync supported) */}
            {otherAvailable.length > 0 && (
                <section aria-labelledby="other-sources-heading" className="mb-12">
                    <h2 id="other-sources-heading" className="text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.25em] pb-6 mb-6 border-b border-[rgba(255,255,255,0.08)]">
                        Other data sources
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {otherAvailable.map(renderCard)}
                    </div>
                </section>
            )}

            {/* Coming soon: listed for visibility, cannot be connected */}
            <section aria-labelledby="coming-soon-heading" className="mb-12">
                <h2 id="coming-soon-heading" className="text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.25em] pb-6 mb-2 border-b border-[rgba(255,255,255,0.08)]">
                    Coming soon
                </h2>
                <p className="text-[0.8rem] text-[#8A8A8A] mb-6">
                    These integrations aren&apos;t available yet and don&apos;t affect your PMF Score.
                </p>
                {CATEGORIES.map((category) => {
                    const categoryIntegrations = comingSoonList.filter(i => i.category === category.id)
                    if (categoryIntegrations.length === 0) return null

                    return (
                        <div key={category.id} className="mb-10">
                            <h3 className="text-[0.6rem] text-[#8A8A8A] uppercase tracking-[0.2em] mb-4">
                                {category.label}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {categoryIntegrations.map(renderCard)}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center py-12 border-t border-[rgba(255,255,255,0.04)] mt-8">
                <div className="text-[0.8rem] text-[#8A8A8A]">
                    {connectedIds.length === 0
                        ? 'No integrations connected yet'
                        : `${connectedIds.length} integration${connectedIds.length > 1 ? 's' : ''} connected`
                    }
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black font-outfit font-medium text-[0.8rem] uppercase tracking-[0.1em] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.1)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}
