'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

// NOTE: Logo upload was removed from onboarding to get founders to their real score faster.
// It belongs in Settings (company profile) — see the previous version of this file for the
// Supabase `logos` bucket upload logic.

// Values are unchanged from the previous onboarding so existing profiles stay compatible.
const stages = [
    {
        value: 'ideation',
        label: 'Ideation',
        description: 'No live product or customers yet.',
    },
    {
        value: 'mvp',
        label: 'Live MVP',
        description: 'Product is live with early users or first paying customers.',
    },
    {
        value: 'growth',
        label: 'Growth',
        description: 'Recurring revenue and a growing customer base.',
    },
    {
        value: 'scaling',
        label: 'Scaling',
        description: 'Established revenue, expanding team or markets.',
    },
]

const dataSources = [
    {
        id: 'paystack',
        name: 'Paystack',
        description: 'For businesses collecting payments in Naira and across Africa.',
    },
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'For businesses billing internationally.',
    },
]

const totalSteps = 3

const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]'

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [trialFailed, setTrialFailed] = useState(false)
    const [formData, setFormData] = useState({
        companyName: '',
        stage: '',
    })

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const canContinue = formData.companyName.trim().length > 0 && formData.stage !== ''

    const saveCompanyDetails = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canContinue) {
            setError('Please enter your company name and choose a stage.')
            return
        }
        setError(null)
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        company_name: formData.companyName.trim(),
                        // Stage is stored in `team_size`, as in the previous onboarding.
                        team_size: formData.stage,
                    })
                    .eq('id', user.id)

                if (updateError) throw updateError
            }
        } catch (err) {
            console.error('Error saving:', err)
            setError('We couldn’t save your details. Please try again.')
            setLoading(false)
            return
        }

        // Start the 14-day trial (plan comes from signup metadata, server-side) before the
        // founder goes on to integrations or the dashboard. 409 = already started: not an error.
        try {
            const res = await fetch('/api/trial/start', { method: 'POST' })
            if (!res.ok && res.status !== 409) throw new Error(`Trial start failed: ${res.status}`)
            setTrialFailed(false)
            setCurrentStep(2)
        } catch (err) {
            console.error('Error starting trial:', err)
            setTrialFailed(true)
            setError('Your details are saved, but we couldn’t start your free trial. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const connectSource = (sourceId: string) => {
        console.log(`[Analytics] onboarding_connect_clicked: source=${sourceId}`)
        router.push(`/dashboard/integrations?connect=${sourceId}`)
    }

    const skipConnect = () => {
        console.log('[Analytics] onboarding_connect_skipped')
        setCurrentStep(3)
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Atmospheric Glow */}
            <div className="fixed top-[-40%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-radial-gradient pointer-events-none opacity-20" />

            {/* Header */}
            <header className="relative z-10 px-6 md:px-16 py-12 flex justify-between items-center border-b border-[rgba(255,255,255,0.04)]">
                <div className="font-outfit text-xs tracking-[0.4em] uppercase text-[#8A8A8A]">Velodesk</div>
                <div className="text-[0.7rem] text-[#8A8A8A] uppercase tracking-[0.15em]" aria-live="polite">
                    Step {currentStep} of {totalSteps}
                </div>
            </header>

            {/* Progress Steps */}
            <div className="relative z-10 flex items-center justify-center gap-0 pt-16 max-w-[600px] mx-auto px-6 md:px-16" aria-hidden="true">
                {[1, 2, 3].map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div
                            className={`w-[10px] h-[10px] rounded-full border transition-all ${step < currentStep
                                ? 'border-[#8A8A8A] bg-[#8A8A8A]'
                                : step === currentStep
                                    ? 'border-white bg-white'
                                    : 'border-[rgba(255,255,255,0.2)] bg-transparent'
                                }`}
                        />
                        {i < totalSteps - 1 && (
                            <div
                                className={`flex-1 h-px mx-4 transition-all ${step < currentStep ? 'bg-[#8A8A8A]' : 'bg-[rgba(255,255,255,0.1)]'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center px-6 md:px-16 py-16">
                <div className="w-full max-w-[600px]">

                    {/* Step 1: Company name & stage */}
                    {currentStep === 1 && (
                        <form className="animate-fade-in" onSubmit={saveCompanyDetails} noValidate>
                            <div className="mb-16">
                                <div className="text-[0.65rem] text-[#8A8A8A] uppercase tracking-[0.3em] mb-8">Step 01</div>
                                <h1 className="font-outfit text-[3rem] font-extralight tracking-tight leading-tight mb-6">
                                    Tell us about<br />your company
                                </h1>
                                <p className="text-[#8A8A8A] text-[1.1rem] font-light leading-relaxed">
                                    Two quick questions, then we&apos;ll connect your data.
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="mb-8 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="mb-12">
                                <label htmlFor="companyName" className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">
                                    Company / Product Name
                                </label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    autoComplete="organization"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="e.g. Acme AI, PayFlow, EduStream"
                                    className="w-full py-6 bg-transparent border-b border-[rgba(255,255,255,0.2)] text-[1.1rem] font-light focus:outline-none focus:border-white focus-visible:ring-2 focus-visible:ring-white/60 transition placeholder:text-[#8A8A8A]"
                                />
                            </div>

                            <fieldset className="mb-12">
                                <legend className="block text-[0.65rem] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">
                                    Current Stage
                                </legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {stages.map((stage) => {
                                        const selected = formData.stage === stage.value
                                        return (
                                            <label
                                                key={stage.value}
                                                className={`relative block p-6 border cursor-pointer transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#050505] ${selected
                                                    ? 'border-white bg-[rgba(255,255,255,0.03)]'
                                                    : 'border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.02)]'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="stage"
                                                    value={stage.value}
                                                    checked={selected}
                                                    onChange={() => setFormData({ ...formData, stage: stage.value })}
                                                    className="sr-only"
                                                    required
                                                />
                                                <span className="block font-outfit font-light text-[1rem] tracking-wide text-white mb-1">
                                                    {stage.label}
                                                </span>
                                                <span className="block text-[0.8rem] text-[#8A8A8A] leading-relaxed">
                                                    {stage.description}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>

                                {formData.stage === 'ideation' && (
                                    <p className="mt-6 text-[0.85rem] text-gray-300 leading-relaxed border-l-2 border-[#7B61FF] pl-4">
                                        Velodesk calculates your PMF Score from real customer and revenue data. You can
                                        finish setup now and connect a data source once you have paying customers or active users.
                                    </p>
                                )}
                            </fieldset>

                            <div className="flex justify-end items-center pt-12 border-t border-[rgba(255,255,255,0.08)]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`text-white text-[0.85rem] uppercase tracking-[0.1em] font-medium flex items-center gap-4 hover:gap-5 transition-all disabled:opacity-50 rounded px-2 py-1 ${focusRing}`}
                                >
                                    {loading ? 'Saving...' : trialFailed ? 'Try again' : 'Continue'} <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Connect first data source */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <div className="mb-16">
                                <div className="text-[0.65rem] text-[#8A8A8A] uppercase tracking-[0.3em] mb-8">Step 02</div>
                                <h1 className="font-outfit text-[3rem] font-extralight tracking-tight leading-tight mb-6">
                                    Connect your first<br />data source
                                </h1>
                                <p className="text-[#8A8A8A] text-[1.1rem] font-light leading-relaxed">
                                    Your PMF Score is calculated from your real payment data. Connect the provider
                                    you use to collect payments. More integrations are coming soon.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                                {dataSources.map((source) => (
                                    <button
                                        key={source.id}
                                        type="button"
                                        onClick={() => connectSource(source.id)}
                                        className={`text-left p-6 border border-[rgba(255,255,255,0.12)] bg-white/[0.02] hover:border-white hover:bg-white/[0.04] transition ${focusRing}`}
                                    >
                                        <span className="block font-outfit text-[1.25rem] font-light text-white mb-2">
                                            Connect {source.name} <span aria-hidden="true">→</span>
                                        </span>
                                        <span className="block text-[0.8rem] text-[#8A8A8A] leading-relaxed">
                                            {source.description}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-12 border-t border-[rgba(255,255,255,0.08)]">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className={`text-[0.85rem] text-[#8A8A8A] uppercase tracking-[0.1em] font-light hover:text-white transition rounded px-2 py-1 ${focusRing}`}
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={skipConnect}
                                    className={`text-[0.85rem] text-[#8A8A8A] uppercase tracking-[0.1em] font-light hover:text-white underline underline-offset-4 transition rounded px-2 py-1 ${focusRing}`}
                                >
                                    Skip for now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: What happens next */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <div className="mb-12">
                                <div className="text-[0.65rem] text-[#8A8A8A] uppercase tracking-[0.3em] mb-8">Setup complete</div>
                                <h1 className="font-outfit text-[2.5rem] font-extralight tracking-tight leading-tight mb-6">
                                    {formData.companyName ? `${formData.companyName} is set up` : 'You’re set up'}
                                </h1>
                                <p className="text-[#8A8A8A] text-[1.1rem] font-light leading-relaxed">
                                    You don&apos;t have a PMF Score yet. It appears on your dashboard once a data
                                    source is connected and your data has synced.
                                </p>
                            </div>

                            <div className="text-left bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-10">
                                <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">What happens next</h2>
                                <ol className="space-y-4 text-[0.95rem] text-gray-300 leading-relaxed list-decimal list-inside">
                                    <li>Connect Paystack or Stripe from the Integrations page.</li>
                                    <li>Velodesk syncs your payment history.</li>
                                    <li>Your PMF Score and the areas to focus on appear on your dashboard.</li>
                                </ol>
                            </div>

                            <Link
                                href="/dashboard/integrations"
                                className={`inline-flex items-center justify-center w-full max-w-[400px] gap-4 px-10 py-5 bg-white text-black font-outfit font-medium text-[0.85rem] uppercase tracking-[0.1em] hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.1)] transition-all mb-6 ${focusRing}`}
                            >
                                Connect a data source <span aria-hidden="true">→</span>
                            </Link>
                            <div className="mt-2">
                                <Link
                                    href="/dashboard"
                                    className={`text-[0.75rem] text-[#8A8A8A] uppercase tracking-[0.1em] font-light hover:text-white transition rounded px-2 py-1 ${focusRing}`}
                                >
                                    Go to dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
