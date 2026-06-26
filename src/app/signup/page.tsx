'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'

export default function SignupPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    company_name: companyName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else if (data.user && data.session) {
            // User is confirmed immediately (email confirmation disabled in Supabase)
            router.push('/onboarding')
        } else if (data.user && !data.session) {
            // Email confirmation required
            setShowConfirmation(true)
            setLoading(false)
        } else {
            router.push('/onboarding')
        }
    }

    const handleGoogleSignup = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    // Email confirmation screen
    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-12">
                        <Logo />
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#22c55e]/20 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📧</span>
                        </div>
                        <h1 className="text-2xl font-light mb-4">Check your email</h1>
                        <p className="text-gray-400 mb-6">
                            We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>.
                            Click the link to activate your account.
                        </p>
                        <div className="text-sm text-gray-500 space-y-2">
                            <p>Didn&apos;t receive the email?</p>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="text-[#22c55e] hover:underline"
                            >
                                Try again with a different email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-12">
                    <Logo />
                </div>

                {/* Card */}
                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg">
                    <h1 className="text-2xl font-light text-center mb-2">Start your free trial</h1>
                    <p className="text-gray-500 text-center mb-4">No credit card required</p>

                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded text-sm text-[#22c55e]">
                            ✓ 14-day free trial • Full access
                        </span>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                                    placeholder="Acme Inc."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Work Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                                placeholder="Min. 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <label className="flex items-start gap-2 text-sm text-gray-400">
                            <input type="checkbox" className="mt-1 rounded" required />
                            <span>
                                I agree to the{' '}
                                <a href="#" className="text-[#22c55e] hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-[#22c55e] hover:underline">Privacy Policy</a>
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full py-3 border border-white/10 rounded hover:bg-white/5 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Sign up with Google
                    </button>
                </div>

                <p className="text-center text-gray-500 mt-8">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#22c55e] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
