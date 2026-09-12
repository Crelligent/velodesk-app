'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const usdPlans = [
    {
        id: 'founder_monthly',
        name: 'Founder',
        price: 15,
        prefix: '$',
        period: '/month',
        features: [
            'Up to 3 PMF Scores',
            '5 integrations',
            'PDF exports'
        ],
    },
    {
        id: 'team_monthly',
        name: 'Team',
        price: 49,
        prefix: '$',
        period: '/month',
        popular: true,
        features: [
            'Unlimited PMF Scores',
            'Unlimited integrations',
            'Signal Feed (Daily Alerts)',
            'Investor-ready Data Room'
        ],
    },
    {
        id: 'accelerator_monthly',
        name: 'Accelerator',
        price: 399,
        prefix: '$',
        period: '/month',
        features: [
            '15 portfolio seats',
            'Global Portfolio Dashboard',
            'Cross-company benchmarking'
        ],
    },
    {
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 'Custom',
        prefix: '',
        period: '',
        features: [
            'Everything in Team',
            'SSO / SAML',
            'Custom AI models',
            'Dedicated support'
        ],
    },
]

const ngnPlans = [
    {
        id: 'founder_monthly',
        name: 'Founder',
        price: '15,000',
        prefix: '₦',
        period: '/month',
        features: [
            'Up to 3 PMF Scores',
            '5 integrations',
            'PDF exports'
        ],
    },
    {
        id: 'team_monthly',
        name: 'Team',
        price: '35,000',
        prefix: '₦',
        period: '/month',
        popular: true,
        features: [
            'Unlimited PMF Scores',
            'Unlimited integrations',
            'Signal Feed (Daily Alerts)',
            'Investor-ready Data Room'
        ],
    },
    {
        id: 'accelerator_monthly',
        name: 'Accelerator',
        price: '200,000',
        prefix: '₦',
        period: '/month',
        features: [
            '15 portfolio seats',
            'Global Portfolio Dashboard',
            'Cross-company benchmarking'
        ],
    },
    {
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 'Custom',
        prefix: '',
        period: '',
        features: [
            'Everything in Team',
            'SSO / SAML',
            'Custom AI models',
            'Dedicated support'
        ],
    },
]

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [usePaystack, setUsePaystack] = useState(false)
    
    const plans = usePaystack ? ngnPlans : usdPlans

    useEffect(() => {
        console.log('[Analytics] pricing_viewed')
    }, [])

    const handleCheckout = async (planId: string) => {
        console.log(`[Analytics] plan_selected: plan=${planId}`)
        if (planId === 'enterprise_monthly') {
            window.location.href = '/contact'
            return
        }
        window.location.href = `/signup?plan=${planId}`
    }

    return (
        <div className="min-h-screen bg-[#04060D] text-white">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-[#04060D]/80 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 relative z-10">
                    <img src="/velodesk%20(2).png" alt="Velodesk" className="h-12 w-auto" />
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-lg tracking-[0.15em] text-white leading-none">VELODESK</span>
                        <span className="font-mono text-[9px] text-white/30 tracking-widest mt-1 uppercase">By Crelligent & Co.</span>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#how-it-works" className="text-sm font-light text-white/50 hover:text-white transition">How it Works</Link>
                    <Link href="/#research" className="text-sm font-light text-white/50 hover:text-white transition">Research</Link>
                    <Link href="/investors" className="text-sm font-light text-white/50 hover:text-white transition">For Investors</Link>
                    <Link href="/pricing" className="text-sm font-light text-white/50 hover:text-white transition">Pricing</Link>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Link href="/login" className="text-sm font-medium text-white hover:text-[#7B61FF] transition">
                        Sign In
                    </Link>
                    <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] hover:brightness-110 text-white text-sm font-medium rounded-full transition border border-white/10">
                        Get Early Access
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="pt-32 pb-24 px-8 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extralight mb-4">Simple, transparent pricing</h1>
                    <p className="text-gray-400">Choose the plan that fits your growth stage.</p>
                </div>

                {/* Payment Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex items-center gap-4 p-2 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setUsePaystack(false)}
                            className={`px-4 py-2 text-sm rounded transition ${!usePaystack ? 'bg-white/10' : 'text-gray-400'
                                }`}
                        >
                            💳 Card (Stripe)
                        </button>
                        <button
                            onClick={() => setUsePaystack(true)}
                            className={`px-4 py-2 text-sm rounded transition ${usePaystack ? 'bg-white/10' : 'text-gray-400'
                                }`}
                        >
                            🇳🇬 Africa (Paystack)
                        </button>
                    </div>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`p-8 border rounded-lg relative ${plan.popular
                                    ? 'border-[#7B61FF] border-2'
                                    : 'border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] text-white text-xs font-medium rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-4">
                                {plan.name}
                            </div>

                            <div className="text-4xl font-extralight mb-2">
                                {plan.price === 'Custom' ? (
                                    plan.price
                                ) : (
                                    <>
                                        {plan.prefix}{plan.price}
                                        <span className="text-base text-gray-500">{plan.period}</span>
                                    </>
                                )}
                            </div>

                            <ul className="space-y-3 text-sm text-gray-400 my-8">
                                {plan.features.map((f) => (
                                    <li key={f}>✓ {f}</li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout(plan.id)}
                                disabled={loading === plan.id}
                                className={`w-full py-3 rounded font-medium transition disabled:opacity-50 ${plan.popular
                                        ? 'bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] text-white hover:brightness-110 border border-white/10'
                                        : 'border border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                {loading === plan.id
                                    ? 'Processing...'
                                    : plan.id.includes('accelerator')
                                            ? 'Apply Now'
                                            : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
