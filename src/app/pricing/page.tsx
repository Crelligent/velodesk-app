'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

const planData = {
    founder: {
        id: 'founder_monthly',
        name: 'Founder plan',
        desc: 'Everything you need to validate your first PMF signals.',
        usd: '15',
        ngn: '30,000',
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
        usd: '49',
        ngn: '50,000',
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
    const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD')
    const [gateway, setGateway] = useState<'stripe' | 'paystack'>('stripe')
    const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Yearly'>('Monthly')

    useEffect(() => {
        console.log('[Analytics] pricing_viewed')
    }, [])

    const handleCheckout = async (planId: string) => {
        console.log(`[Analytics] plan_selected: plan=${planId}`)
        setLoading(planId)
        window.location.href = `/signup?plan=${planId}&gateway=${gateway}&currency=${currency}`
    }

    const founderPrice = currency === 'USD' ? planData.founder.usd : planData.founder.ngn
    const startupPrice = currency === 'USD' ? planData.startup.usd : planData.startup.ngn
    const symbol = currency === 'USD' ? 'US $' : '&#8358;'

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#7B61FF]/30 font-inter font-light">
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
                <div className="text-center mb-16 max-w-3xl mx-auto flex flex-col items-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
                        Pricing that scales with you
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        14-day free trial on Founder & Startup plans. Surprisingly simple, exceptionally powerful. Every feature you need now and as you scale.
                    </p>
                </div>

                {/* Toggles */}
                <div className="flex flex-col items-center gap-6 mb-16">
                    {/* Monthly/Yearly */}
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
                        </button>
                    </div>

                    {/* Currency Toggle Switch */}
                    <div className="flex items-center gap-3 mt-4">
                        <span className={`text-sm font-medium transition-colors ${currency === 'USD' ? 'text-white' : 'text-gray-500'}`}>USD ($)</span>
                        <button
                            onClick={() => {
                                const newCurr = currency === 'USD' ? 'NGN' : 'USD'
                                setCurrency(newCurr)
                                setGateway(newCurr === 'USD' ? 'stripe' : 'paystack')
                            }}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none border border-white/10 ${
                                currency === 'NGN' ? 'bg-[#7B61FF]' : 'bg-white/10'
                            }`}
                        >
                            <span
                                className={`absolute top-[3px] left-[3px] bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                                    currency === 'NGN' ? 'translate-x-[22px]' : 'translate-x-0'
                                }`}
                            />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${currency === 'NGN' ? 'text-white' : 'text-gray-500'}`}>NGN (&#8358;)</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    {/* Founder */}
                    <div className="bg-[#0A0A0A] p-10 flex flex-col">
                        <h3 className="text-lg font-medium text-white mb-2">{planData.founder.name}</h3>
                        <p className="text-sm text-gray-400 mb-8 min-h-[40px]">{planData.founder.desc}</p>
                        
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-sm text-gray-400 font-medium" dangerouslySetInnerHTML={{__html: symbol}}></span>
                            <span className="text-5xl font-bold text-white tracking-tight">{founderPrice}</span>
                            <span className="text-sm text-gray-500">per month</span>
                        </div>
                        
                        <button 
                            onClick={() => handleCheckout(planData.founder.id)}
                            className="w-48 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all mb-10 border border-white/5"
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
                            <span className="text-sm text-gray-400 font-medium" dangerouslySetInnerHTML={{__html: symbol}}></span>
                            <span className="text-5xl font-bold text-white tracking-tight">{startupPrice}</span>
                            <span className="text-sm text-gray-500">per month</span>
                        </div>
                        
                        <button 
                            onClick={() => handleCheckout(planData.startup.id)}
                            className="w-48 py-2.5 bg-[#7B61FF] hover:bg-[#8A73FF] text-white rounded-lg text-sm font-medium transition-all mb-10"
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

                {/* Bottom Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden mt-8 border border-white/5">
                    
                    <div className="bg-[#0A0A0A] p-10 flex flex-col justify-between border-r border-white/5">
                        <div>
                            <div className="text-sm font-medium text-white mb-4">Enterprise</div>
                            <h4 className="text-xl font-medium text-white mb-4 pr-8">
                                Need more support and compliance features or pricing doesn't work for your business?
                            </h4>
                        </div>
                        <Link href="/contact" className="inline-flex w-fit px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition border border-white/10 mt-6">
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
                        <Link href="/investors" className="inline-flex w-fit px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition border border-white/10 mt-6">
                            Apply now
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    )
}
