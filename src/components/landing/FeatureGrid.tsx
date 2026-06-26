'use client'

import {
    Plug,
    BarChart3,
    FlaskConical,
    Target,
    FileText,
    Tag,
    Zap,
    Sparkles,
    Glasses,
    Rocket,
    Bot,
} from 'lucide-react'

const features = [
    {
        icon: Plug,
        title: 'Deep Integrations',
        desc: 'Stripe, Mixpanel, HubSpot, Amplitude, Intercom, Salesforce, Google Analytics, and more.',
        badge: null
    },
    {
        icon: BarChart3,
        title: 'Retention Analysis',
        desc: 'Day 1/7/30/90 retention curves, cohort tables, churn by segment, and engagement drivers.',
        badge: null
    },
    {
        icon: FlaskConical,
        title: 'Experiment Tracking',
        desc: 'Log hypotheses, track A/B tests, validate assumptions with statistical significance.',
        badge: null
    },
    {
        icon: Target,
        title: 'Lead Scoring',
        desc: 'ML-powered lead scoring based on behavior, company fit, and engagement signals.',
        badge: null
    },
    {
        icon: FileText,
        title: 'Investor Reports',
        desc: 'One-click shareable reports with verified badges. Auto-generated executive summaries.',
        badge: null
    },
    {
        icon: Tag,
        title: 'Embeddable Badges',
        desc: 'Show your PMF score on your website with dynamic SVG badges. Build trust instantly.',
        badge: null
    },
    {
        icon: Zap,
        title: 'Rapid Prototyping',
        desc: 'Test new features and ideas quickly. Build MVPs, validate concepts, and iterate fast.',
        badge: null
    },
    {
        icon: Sparkles,
        title: 'What-If Simulations',
        desc: 'Model pricing changes, churn scenarios, and growth projections. See the impact before you act.',
        badge: null
    },
    {
        icon: Glasses,
        title: 'AR Lab',
        desc: 'Immersive 3D visualization of your PMF score. Perfect for investor presentations and demos.',
        badge: 'New'
    },
]

const premiumFeatures = [
    {
        icon: Rocket,
        title: 'GTM Strategy Generator',
        desc: 'AI-generated go-to-market strategies based on your metrics, market position, and competitive landscape.',
        label: 'Pro Feature',
        gradient: 'from-[#22c55e]/10 to-transparent',
        border: 'border-[#22c55e]/20'
    },
    {
        icon: Bot,
        title: 'AI Co-pilot',
        desc: 'Natural language queries on your data. Ask "Why did churn spike in January?" and get instant answers.',
        label: 'Pro Feature',
        gradient: 'from-[#3b82f6]/10 to-transparent',
        border: 'border-[#3b82f6]/20'
    },
]

export function FeatureGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {features.map((feature) => {
                const IconComponent = feature.icon
                return (
                    <div key={feature.title} className="p-6 bg-white/[0.02] border border-white/10 rounded-lg hover:border-[#22c55e]/30 transition group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-[#22c55e] stroke-[1.5]" />
                            </div>
                            {feature.badge && (
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${feature.badge === 'New'
                                    ? 'bg-[#22c55e]/20 text-[#22c55e]'
                                    : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {feature.badge}
                                </span>
                            )}
                        </div>
                        <h3 className="font-medium mb-2 group-hover:text-[#22c55e] transition">{feature.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                )
            })}
        </div>
    )
}

export function PremiumFeatures() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumFeatures.map((feature) => {
                const IconComponent = feature.icon
                return (
                    <div key={feature.title} className={`p-8 bg-gradient-to-br ${feature.gradient} border ${feature.border} rounded-lg`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-white stroke-[1.5]" />
                            </div>
                            <div>
                                <h3 className="font-medium">{feature.title}</h3>
                                <span className="text-xs text-[#22c55e]">{feature.label}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {feature.desc}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
