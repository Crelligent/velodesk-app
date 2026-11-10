'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

// Unverified enterprise claims (SLA, compliance) are hidden until the owner confirms them.
const SHOW_UNVERIFIED_CLAIMS = false

// Source of truth for displayed prices. The JSON-LD offers in app/layout.tsx mirror these —
// update both together.
const planData = {
    founder: {
        id: 'founder_monthly',
        name: 'Founder plan',
        desc: 'Everything you need to validate your first PMF signals.',
        ngn: '10,000',
        featuresTitle: 'Start validating',
        features: [
            'Up to 3 PMF Scores',
            '5 active integrations',
            'Pre-built dashboard components',
            'PDF exports'
        ]
    },
    startup: {
        id: 'startup_monthly',
        name: 'Startup plan',
        desc: 'Powerful extra features for your growing business.',
        ngn: '25,000',
        featuresTitle: 'Scale your startup',
        features: [
            'Unlimited PMF Scores',
            'Unlimited integrations',
            'Signal Feed (Daily Alerts)',
            'Investor-ready Data Room',
            'Customizable reporting'
        ]
    }
}

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null)
    // Velodesk bills in Naira only, through Paystack.
    const currency = 'NGN'
    // TODO(pricing): add a Monthly/Yearly toggle back once yearly prices exist in planData
    // and in the Paystack plan config. It was removed because it changed nothing.

    // Set when the dashboard sends a signed-in user here (?error=trial_ended etc.).
    const [accountNotice, setAccountNotice] = useState<string | null>(null)

    useEffect(() => {
        console.log('[Analytics] pricing_viewed')
        const reason = new URLSearchParams(window.location.search).get('error')
        const messages: Record<string, string> = {
            trial_ended: 'Your free trial on this account has ended.',
            subscription_ended: 'Your subscription on this account has ended.',
            subscription_required: 'This account doesn\u2019t have an active plan yet.',
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once on load
        if (reason && messages[reason]) setAccountNotice(messages[reason])
    }, [])

    const handleCheckout = async (planId: string) => {
        console.log(`[Analytics] plan_selected: plan=${planId}`)
        setLoading(planId)
        // No checkout here: the 14-day trial starts without a card. Signup stores plan + currency.
        window.location.href = `/signup?plan=${planId}&currency=${currency}`
    }

    const founderPrice = planData.founder.ngn
    const startupPrice = planData.startup.ngn
    const symbol = '\u20A6'

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#7B61FF]/30 font-inter font-light">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-[#0A0A0A]/70 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 relative z-10">
                    <img src="/velodesk%20(2).png" alt="Velodesk" className="h-8 w-auto" />
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-sm tracking-[0.15em] text-white leading-none">VELODESK</span>
                        <span className="font-mono text-[8px] text-[#8A8A8A] tracking-widest mt-1 uppercase">By Crelligent</span>
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    <Link href="/#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it Works</Link>
                    <Link href="/pricing" className="text-sm text-white hover:text-white transition">Pricing</Link>
                    <Link href="/investors" className="text-sm text-gray-400 hover:text-white transition">For Investors</Link>
                    <Link href="/#research" className="text-sm text-gray-400 hover:text-white transition">Research</Link>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">
                        Sign In
                    </Link>
                    <Link href="/pricing" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition border border-white/5 backdrop-blur-sm">
                        Start Free Trial
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="pt-40 pb-24 px-6 md:px-8 max-w-[1000px] mx-auto relative z-10">
                {accountNotice && (
                    <div role="status" className="mb-12 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] px-5 py-4 text-sm text-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p>
                            <span className="font-medium text-white">{accountNotice}</span>{' '}
                            Choose a plan below to keep going, or sign out to use a different account.
                        </p>
                        <form action="/auth/signout" method="post" className="shrink-0">
                            <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]">
                                Sign out
                            </button>
                        </form>
                    </div>
                )}
                <div className="text-center mb-16 max-w-3xl mx-auto flex flex-col items-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
                        Pricing that scales with you
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        14-day free trial on Founder & Startup plans. Surprisingly simple, exceptionally powerful. Every feature you need now and as you scale.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 mb-16">
                    <p className="text-xs text-[#8A8A8A]">
                        Prices in Naira (&#8358;). Billing is processed by Paystack.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    {/* Founder */}
                    <div className="bg-[#0A0A0A] p-10 flex flex-col">
                        <h3 className="text-lg font-medium text-white mb-2">{planData.founder.name}</h3>
                        <p className="text-sm text-gray-400 mb-8 min-h-[40px]">{planData.founder.desc}</p>
                        
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-sm text-gray-400 font-medium">{symbol}</span>
                            <span className="text-5xl font-bold text-white tracking-tight">{founderPrice}</span>
                            <span className="text-sm text-[#8A8A8A]">per month</span>
                        </div>
                        
                        <button 
                            onClick={() => handleCheckout(planData.founder.id)}
                            type="button"
                            className="w-48 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all mb-10 border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                        >
                            {loading === planData.founder.id ? 'Processing...' : 'Start 14-Day Free Trial'}
                        </button>
                        
                        <div className="text-sm font-medium text-white mb-6">{planData.founder.featuresTitle}</div>
                        
                        <ul className="space-y-4 flex-grow">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                                <span>No credit card required upfront</span>
                            </li>
                            {planData.founder.features.map(f => (
                                <li key={f} className="flex items-start gap-3 text-sm text-gray-400">
                                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Startup */}
                    <div className="bg-[#111111] p-10 flex flex-col relative border-l border-white/5">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]" />
                        
                        <h3 className="text-lg font-medium text-[#38BDF8] mb-2">{planData.startup.name}</h3>
                        <p className="text-sm text-gray-400 mb-8 min-h-[40px]">{planData.startup.desc}</p>
                        
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-sm text-gray-400 font-medium">{symbol}</span>
                            <span className="text-5xl font-bold text-white tracking-tight">{startupPrice}</span>
                            <span className="text-sm text-[#8A8A8A]">per month</span>
                        </div>
                        
                        <button 
                            onClick={() => handleCheckout(planData.startup.id)}
                            type="button"
                            className="w-48 py-2.5 bg-[#7B61FF] hover:bg-[#8A73FF] text-white rounded-lg text-sm font-medium transition-all mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                        >
                            {loading === planData.startup.id ? 'Processing...' : 'Start 14-Day Free Trial'}
                        </button>
                        
                        <div className="text-sm font-medium text-white mb-6">{planData.startup.featuresTitle}</div>
                        
                        <ul className="space-y-4 flex-grow">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                                <span>No credit card required upfront</span>
                            </li>
                            {planData.startup.features.map(f => (
                                <li key={f} className="flex items-start gap-3 text-sm text-gray-400">
                                    <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Middle Horizontal Suites */}
                <div className="mt-8 space-y-8">
                    
                    {/* Investor Intelligence Suite */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-white/5">
                            <h3 className="text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-2">Intelligence Suite</h3>
                            <h4 className="text-xl font-medium text-white">The easy solution to investor reporting.</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            {/* Founder Col */}
                            <div className="p-6 md:p-8">
                                <div className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                                    Intelligence in <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">Founder</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Up to 3 PMF baseline scores</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Static PDF tear-sheet exports</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Standard metric tracking</span></li>
                                </ul>
                            </div>
                            {/* Startup Col */}
                            <div className="p-6 md:p-8">
                                <div className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                                    Intelligence in <span className="bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded text-xs">Startup</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Live investor-ready data room</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Automated daily Signal Feeds</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Unlimited historical tracking</span></li>
                                </ul>
                            </div>
                            {/* Add-on Col */}
                            <div className="p-6 md:p-8 relative">
                                <div className="text-sm font-medium text-white mb-6 flex items-center justify-between">
                                    <span>Enterprise AI Add-on</span>
                                    <span className="text-xs text-[#8A8A8A]">Custom</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>Custom trained PMF models</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>Dedicated cloud deployment</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>SSO / SAML authentication</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Integrations Suite */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-white/5">
                            <h3 className="text-[#7B61FF] text-xs font-bold uppercase tracking-wider mb-2">Ecosystem Sync</h3>
                            <h4 className="text-xl font-medium text-white">Connect your entire growth stack.</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            {/* Founder Col */}
                            <div className="p-6 md:p-8">
                                <div className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                                    Integrations in <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-300">Founder</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Up to 5 active connections</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Stripe & payment billing sync</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#7B61FF] shrink-0 mt-0.5" /><span>Basic CRM connectors</span></li>
                                </ul>
                            </div>
                            {/* Startup Col */}
                            <div className="p-6 md:p-8">
                                <div className="text-sm font-medium text-white mb-6 flex items-center gap-2">
                                    Integrations in <span className="bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded text-xs">Startup</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Unlimited active connections</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Hubspot & Salesforce native</span></li>
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" /><span>Custom Webhooks & REST APIs</span></li>
                                </ul>
                            </div>
                            {/* Add-on Col */}
                            <div className="p-6 md:p-8 relative">
                                <div className="text-sm font-medium text-white mb-6 flex items-center justify-between">
                                    <span>Infrastructure Add-on</span>
                                    <span className="text-xs text-[#8A8A8A]">Custom</span>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>Dedicated isolated database</span></li>
                                    {SHOW_UNVERIFIED_CLAIMS && (
                                        <>
                                            <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>SLA uptime guarantees</span></li>
                                            <li className="flex items-start gap-3 text-sm text-gray-400"><Check className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span>Enterprise data compliance</span></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden mt-8 border border-white/5">
                    
                    <div className="bg-[#0A0A0A] p-10 flex flex-col justify-between border-r border-white/5">
                        <div>
                            <div className="text-sm font-medium text-white mb-4">Enterprise</div>
                            <h4 className="text-xl font-medium text-white mb-4 pr-8">
                                Need more support and compliance features or pricing doesn't work for your business?
                            </h4>
                        </div>
                        <Link href="/contact" className="inline-flex w-fit px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition border border-white/10 mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]">
                            Contact sales
                        </Link>
                    </div>

                    <div className="bg-[#0A0A0A] p-10 flex flex-col justify-between">
                        <div>
                            <div className="text-sm font-medium text-white mb-4">Investors</div>
                            <h4 className="text-xl font-medium text-white mb-4 pr-8">
                                Pre-negotiated portfolio discounts and global dashboard available for your entire batch.
                            </h4>
                        </div>
                        <Link href="/investors" className="inline-flex w-fit px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition border border-white/10 mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]">
                            Apply now
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    )
}
