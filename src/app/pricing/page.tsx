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
        id: 'startup_monthly',
        name: 'Startup',
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
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 'Custom',
        prefix: '',
        period: '',
        features: [
            'Everything in Startup',
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
        price: '30,000',
        prefix: '₦',
        period: '/month',
        features: [
            'Up to 3 PMF Scores',
            '5 integrations',
            'PDF exports'
        ],
    },
    {
        id: 'startup_monthly',
        name: 'Startup',
        price: '50,000',
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
        id: 'enterprise_monthly',
        name: 'Enterprise',
        price: 'Custom',
        prefix: '',
        period: '',
        features: [
            'Everything in Startup',
            'SSO / SAML',
            'Custom AI models',
            'Dedicated support'
        ],
    },
]

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD')
    const [gateway, setGateway] = useState<'stripe' | 'paystack'>('stripe')
    const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Yearly'>('Monthly')
    const [expandedTable, setExpandedTable] = useState<string | null>(null)

    const featureComparison = [
        { name: 'PMF Scores', founder: 'Up to 3', startup: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Integrations', founder: '5', startup: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'PDF Exports', founder: 'Included', startup: 'Included', enterprise: 'Included' },
        { name: 'Signal Feed', founder: '-', startup: 'Included', enterprise: 'Included' },
        { name: 'Data Room', founder: '-', startup: 'Included', enterprise: 'Included' },
        { name: 'SSO / SAML', founder: '-', startup: '-', enterprise: 'Included' },
        { name: 'Custom AI Models', founder: '-', startup: '-', enterprise: 'Included' },
        { name: 'Support', founder: 'Standard', startup: 'Priority', enterprise: 'Dedicated' },
    ]
    
    const plans = currency === 'NGN' ? ngnPlans : usdPlans

    useEffect(() => {
        console.log('[Analytics] pricing_viewed')
    }, [])

    const handleCheckout = async (planId: string) => {
        console.log(`[Analytics] plan_selected: plan=${planId}`)
        if (planId === 'enterprise_monthly') {
            window.location.href = '/contact'
            return
        }
        window.location.href = `/signup?plan=${planId}&gateway=${gateway}&currency=${currency}`
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-white/[0.05] to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-r from-[#7B61FF]/10 to-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-[#0A0A0A]/70 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 relative z-10">
                    <img src="/velodesk%20(2).png" alt="Velodesk" className="h-8 w-auto" />
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-sm tracking-[0.15em] text-white leading-none">VELODESK</span>
                        <span className="font-mono text-[8px] text-white/30 tracking-widest mt-1 uppercase">By Crelligent</span>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#how-it-works" className="text-sm font-light text-gray-400 hover:text-white transition">How it Works</Link>
                    <Link href="/pricing" className="text-sm font-light text-white hover:text-white transition">Pricing</Link>
                    <Link href="/investors" className="text-sm font-light text-gray-400 hover:text-white transition">For Investors</Link>
                    <Link href="/#research" className="text-sm font-light text-gray-400 hover:text-white transition">Research</Link>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">
                        Sign In
                    </Link>
                    <Link href="/signup" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition border border-white/5 backdrop-blur-sm">
                        Get Early Access
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="pt-40 pb-24 px-6 md:px-8 max-w-[1200px] mx-auto relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        14-Day Free Trial on Founder & Startup plans
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                        All-in-one product intelligence.<br />Powered by AI.
                    </h1>
                    <p className="text-lg text-gray-400 font-light max-w-xl leading-relaxed">
                        PMF tracking, integrations, AI Assistant, automated dataroom generator, and benchmarking - all in one powerful package.
                    </p>
                </div>

                {/* Toggles */}
                <div className="flex flex-col items-center gap-6 mb-16">
                    {/* Monthly/Yearly Toggle */}
                    <div className="inline-flex items-center p-1 bg-[#111] rounded-full border border-white/5">
                        <button
                            onClick={() => setBillingPeriod('Monthly')}
                            className={`px-6 py-2 text-sm rounded-full transition-all ${billingPeriod === 'Monthly' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('Yearly')}
                            className={`px-6 py-2 text-sm rounded-full transition-all flex items-center gap-2 ${billingPeriod === 'Yearly' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Yearly
                            <span className="text-[10px] uppercase font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full">Save 20%</span>
                        </button>
                    </div>

                    {/* Currency & Gateway Toggles */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <span>Currency:</span>
                            <button
                                onClick={() => {
                                    setCurrency('USD')
                                }}
                                className={`transition hover:text-gray-300 ${currency === 'USD' ? 'text-white underline underline-offset-4 decoration-white/30' : ''}`}
                            >
                                USD ($)
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                onClick={() => {
                                    setCurrency('NGN')
                                    setGateway('paystack') // Stripe doesn't support NGN
                                }}
                                className={`transition hover:text-gray-300 ${currency === 'NGN' ? 'text-white underline underline-offset-4 decoration-white/30' : ''}`}
                            >
                                NGN (?)
                            </button>
                        </div>

                        <div className="w-px h-4 bg-white/10 hidden sm:block"></div>

                        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <span>Processor:</span>
                            <button
                                onClick={() => {
                                    setGateway('stripe')
                                    setCurrency('USD') // Stripe must be USD
                                }}
                                className={`transition hover:text-gray-300 ${gateway === 'stripe' ? 'text-white underline underline-offset-4 decoration-white/30' : ''}`}
                            >
                                Stripe (Global)
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                onClick={() => setGateway('paystack')}
                                className={`transition hover:text-gray-300 ${gateway === 'paystack' ? 'text-white underline underline-offset-4 decoration-white/30' : ''}`}
                            >
                                Paystack (Africa)
                            </button>
                        </div>
                    </div></div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`p-8 rounded-2xl relative flex flex-col transition-all duration-300 ${
                                plan.popular
                                    ? 'bg-[#151515] border border-white/10 shadow-[0_0_40px_rgba(123,97,255,0.05)]'
                                    : 'bg-[#0A0A0A] border border-white/5 hover:bg-[#0D0D0D]'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#7B61FF] to-transparent opacity-50" />
                            )}
                            
                            <div className="flex items-center gap-2 mb-6">
                                <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                                {plan.popular && (
                                    <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-sm">+30% off during early access</span>
                                )}
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-semibold text-white tracking-tight">
                                        {plan.price === 'Custom' ? plan.price : (
                                            <>
                                                {plan.prefix}
                                                {billingPeriod === 'Yearly' && plan.price !== 'Custom' 
                                                    ? (parseFloat(String(plan.price).replace(/,/g, '')) * 0.8).toLocaleString() 
                                                    : plan.price}
                                            </>
                                        )}
                                    </span>
                                    {plan.price !== 'Custom' && (
                                        <span className="text-sm text-gray-500 font-light">/ month</span>
                                    )}
                                </div>
                                {plan.price !== 'Custom' && billingPeriod === 'Yearly' && (
                                    <div className="text-xs text-gray-500 mt-1">billed yearly</div>
                                )}
                            </div>

                            <ul className="space-y-4 text-sm text-gray-400 flex-grow mb-8">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 group">
                                        <svg className="w-4 h-4 mt-0.5 text-[#38BDF8] opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout(plan.id)}
                                disabled={loading === plan.id}
                                className={`w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 mt-auto ${
                                    plan.popular
                                        ? 'bg-[#7B61FF]/10 text-[#7B61FF] hover:bg-[#7B61FF]/20 border border-[#7B61FF]/20'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                            >
                                {loading === plan.id
                                    ? 'Processing...'
                                    : plan.id.includes('accelerator')
                                            ? 'Apply Now'
                                            : plan.id.includes('enterprise')
                                                ? 'Contact Sales'
                                                : 'Start 14-Day Free Trial'}
                            </button>
                            
                            <button
                                onClick={() => setExpandedTable(expandedTable === plan.id ? null : plan.id)}
                                className="text-xs text-gray-500 hover:text-white mt-6 w-full text-center flex items-center justify-center gap-1 transition"
                            >
                                See full features
                                <svg className={`w-3 h-3 transition-transform ${expandedTable === plan.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {expandedTable === plan.id && (
                                <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="space-y-3">
                                        {featureComparison.map((f) => {
                                            const val = plan.id.includes('founder') ? f.founder : plan.id.includes('startup') ? f.startup : f.enterprise;
                                            return (
                                                <div key={f.name} className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400">{f.name}</span>
                                                    <span className={`font-medium ${val === '-' ? 'text-gray-600' : 'text-gray-200'}`}>
                                                        {val === 'Included' ? (
                                                            <svg className="w-3.5 h-3.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : val}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Supporters receive a 30% discount on early access, plus an extra 20% off the yearly plan. They also get behind-the-scenes access to the product, code, insights, and the opportunity to help shape its development.
                    </p>
                </div>
            </div>
        </div>
    )
}
