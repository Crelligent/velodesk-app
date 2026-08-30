'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, TrendingUp, Shield } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Left Panel: Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between px-8 py-10 lg:px-16 lg:py-12 relative z-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/velodesk (2).png" alt="Velodesk" className="h-8 w-auto" />
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-sm tracking-[0.15em] text-white leading-none">VELODESK</span>
                    </div>
                </Link>

                <div className="w-full max-w-md mx-auto my-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-3xl font-light text-white mb-2 font-['Outfit']">Welcome back</h1>
                        <p className="text-gray-400 mb-8">Sign in to your account to continue</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white transition-colors"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-mono uppercase tracking-wider text-gray-500">Password</label>
                                    <Link href="/forgot-password" className="text-xs text-[#7B61FF] hover:text-[#907aff] transition">
                                        Forgot password?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white transition-colors tracking-widest"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 bg-gradient-to-r from-[#7B61FF] via-[#5B8DEF] to-[#38BDF8] text-white font-medium rounded-xl hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Signing in...' : (
                                    <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">or continue with</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-3.5 border border-white/10 rounded-xl hover:bg-white/5 text-white transition flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <p className="text-center text-sm text-gray-500 mt-8">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-[#7B61FF] hover:text-white transition">
                                Get Early Access
                            </Link>
                        </p>
                    </motion.div>
                </div>
                
                <div className="text-xs text-gray-600 font-mono flex items-center justify-between">
                    <span>© 2026 Velodesk</span>
                    <a href="mailto:support@velodesk.com" className="hover:text-gray-400">support@velodesk.com</a>
                </div>
            </div>

            {/* Right Panel: Feature Graphic */}
            <div className="hidden lg:flex w-[55%] bg-[#0a0c16] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#7B61FF]/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#38BDF8]/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <div className="bg-[#050505]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="flex gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B61FF]/20 to-[#38BDF8]/20 flex items-center justify-center border border-white/5">
                                <Activity className="w-6 h-6 text-[#7B61FF]" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-lg">Real-time Telemetry</h3>
                                <p className="text-gray-400 text-sm">Monitor your PMF Score™ as it evolves.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "78%" }}
                                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]"
                                />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-gray-500">
                                <span>Signal Strength</span>
                                <span className="text-[#38BDF8]">78 / 100</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-white text-xl font-medium">Top 5%</span>
                                <span className="text-xs text-gray-500">Growth Velocity</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
                                <Shield className="w-5 h-5 text-[#7B61FF]" />
                                <span className="text-white text-xl font-medium">Verified</span>
                                <span className="text-xs text-gray-500">Board Ready Data</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
