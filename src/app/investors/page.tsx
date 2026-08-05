import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, ShieldCheck } from 'lucide-react'

export default function InvestorsLandingPage() {
    return (
        <div className="min-h-screen bg-[#04060D] text-white selection:bg-[#7B61FF]/30 font-inter">
            {/* Premium Navbar */}
            <nav className="h-20 flex items-center justify-between px-8 border-b border-white/5 sticky top-0 bg-[#04060D]/60 backdrop-blur-2xl z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#7B61FF] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                        <img src="/velodesk (2).png" alt="Velodesk" className="h-10 w-auto relative z-10" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-xl tracking-[0.15em] text-white leading-none">VELODESK</span>
                        <span className="font-mono text-[9px] text-[#7B61FF] tracking-widest mt-1 uppercase">For Investors</span>
                    </div>
                </Link>
                
                <div className="hidden md:flex items-center gap-10">
                    <Link href="#features" className="text-sm font-light text-white/50 hover:text-white transition">Platform Overview</Link>
                    <Link href="#dealflow" className="text-sm font-light text-white/50 hover:text-white transition">Dealflow Intelligence</Link>
                    <Link href="#security" className="text-sm font-light text-white/50 hover:text-white transition">Data Security</Link>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/auth/login" className="text-sm font-medium text-white/70 hover:text-white transition">Fund Login</Link>
                    <Link href="/investor/dashboard" className="px-6 py-2.5 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] hover:brightness-110 text-white text-sm font-medium rounded-full transition shadow-[0_0_20px_rgba(123,97,255,0.3)] border border-white/10">
                        Enter Portal
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#7B61FF]/10 to-transparent pointer-events-none" />
                
                <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
                    Track the <span className="font-medium bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] bg-clip-text text-transparent">Product-Market Fit</span> of your entire portfolio.
                </h1>
                
                <p className="text-xl text-white/50 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
                    Velodesk gives Accelerators, Incubators, and VC Funds a real-time command center to track the PMF velocity of their founders before and after the check is written.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link href="/investor/dashboard" className="px-8 py-4 bg-white text-[#04060D] rounded-full font-medium hover:bg-white/90 transition flex items-center gap-2 group">
                        Access Investor Portal
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="#features" className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition">
                        See how it works
                    </Link>
                </div>
            </section>

            {/* Value Props */}
            <section id="features" className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                            <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium mb-3">Portfolio Overview</h3>
                        <p className="text-white/50 leading-relaxed font-light">
                            Monitor the live PMF score of every startup in your cohort. See exactly who is finding traction and who needs immediate operational intervention.
                        </p>
                    </div>
                    
                    <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                            <BarChart3 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-medium mb-3">Live Data Rooms</h3>
                        <p className="text-white/50 leading-relaxed font-light">
                            No more waiting for end-of-month updates. Founders connect their Stripe and analytics directly, giving you verified, un-tampered growth metrics.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="w-12 h-12 bg-[#7B61FF]/10 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6 text-[#7B61FF]" />
                        </div>
                        <h3 className="text-xl font-medium mb-3">De-Risk Dealflow</h3>
                        <p className="text-white/50 leading-relaxed font-light">
                            Invite prospects to use Velodesk during due diligence. Track their PMF score during the evaluation period to make data-backed investment decisions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-32 px-6 text-center border-t border-white/5">
                <h2 className="text-3xl font-light mb-6">Ready to upgrade your fund&apos;s operations?</h2>
                <Link href="/investor/dashboard" className="inline-flex px-8 py-4 bg-[#7B61FF] text-white rounded-full font-medium hover:bg-[#8A73FF] transition shadow-[0_0_40px_-10px_#7B61FF]">
                    Go to Investor Portal
                </Link>
            </section>
        </div>
    )
}
