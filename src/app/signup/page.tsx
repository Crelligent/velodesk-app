'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resendSignupEmail, signUpUser } from '@/app/actions'
import { FormEngine, FormSchema } from '@/components/forms/FormEngine'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getPerk, PERK_TRIAL_DAYS } from '@/lib/perks'
import Link from 'next/link'
import { Database, LineChart } from 'lucide-react'

const RESEND_WAIT_SECONDS = 50

/** "Didn't get the email? Resend" with a countdown so people can't hammer the button. */
function ResendConfirmation({ email }: { email: string }) {
    const [secondsLeft, setSecondsLeft] = useState(RESEND_WAIT_SECONDS)
    const [sending, setSending] = useState(false)
    const [note, setNote] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (secondsLeft <= 0) return
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
        return () => clearTimeout(t)
    }, [secondsLeft])

    const resend = async () => {
        setSending(true)
        setNote(null)
        const res = await resendSignupEmail(email, window.location.origin)
        setSending(false)
        if ('ok' in res && res.ok) {
            setNote({ tone: 'ok', text: 'Sent. Check your inbox and spam folder.' })
            setSecondsLeft(RESEND_WAIT_SECONDS)
        } else {
            setNote({ tone: 'error', text: res.error ?? 'Something went wrong. Please try again.' })
            if ('retryAfter' in res && res.retryAfter) setSecondsLeft(res.retryAfter)
        }
    }

    return (
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
            <span className="whitespace-nowrap text-gray-400">Didn&apos;t get the email? </span>
            {secondsLeft > 0 ? (
                <span className="whitespace-nowrap text-gray-500 tabular-nums" aria-live="polite">
                    Resend in 0:{String(secondsLeft).padStart(2, '0')}
                </span>
            ) : (
                <button
                    type="button"
                    onClick={resend}
                    disabled={sending}
                    className="font-medium text-[#7B61FF] hover:text-white transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] rounded"
                >
                    {sending ? 'Sending…' : 'Resend email'}
                </button>
            )}
            {note && (
                <p role="status" className={`mt-2 text-xs ${note.tone === 'ok' ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {note.text}
                </p>
            )}
            <p className="mt-2 text-xs text-gray-500">Check your spam or promotions folder too.</p>
        </div>
    )
}

const PLAN_NAMES: Record<string, string> = {
    founder_monthly: 'Founder plan',
    startup_monthly: 'Startup plan',
}

const signupSchema: FormSchema = {
    id: 'velodesk-signup-form-v1',
    title: 'Start your 14-day free trial',
    description: 'No credit card required. Your company details come next.',
    submitLabel: 'Create account',
    fields: [
        {
            id: 'fullName',
            type: 'text',
            label: 'Full Name',
            placeholder: 'John Doe',
            required: true,
            autoComplete: 'name'
        },
        {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'you@company.com',
            required: true,
            autoComplete: 'email'
        },
        {
            id: 'password',
            type: 'password',
            label: 'Password',
            placeholder: 'Min. 8 characters',
            required: true,
            autoComplete: 'new-password',
            hint: 'At least 8 characters.'
        },
        {
            id: 'terms',
            type: 'checkbox',
            label: 'Terms of Service',
            placeholder: 'I agree to the Terms of Service and Privacy Policy',
            required: true
        }
    ]
}

function SignupForm() {
    const [sessionId, setSessionId] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [email, setEmail] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const planParam = searchParams.get('plan')
    // Only accept plans we actually sell; anything else is ignored.
    const planId = planParam && PLAN_NAMES[planParam] ? planParam : null
    const currency = searchParams.get('currency') === 'NGN' ? 'NGN' : 'USD'
    // Partner perk (?perk=<code>, set by /api/perks/claim): longer trial, attributed to the partner.
    const perk = getPerk(searchParams.get('perk'))
    const schema: FormSchema = perk
        ? {
            ...signupSchema,
            title: `Start your ${PERK_TRIAL_DAYS}-day free trial`,
            description: `${perk.partner} founder offer. No credit card required. Your company details come next.`,
        }
        : signupSchema

    useEffect(() => {
        if (planId) {
            console.log(`[Analytics] signup_started: plan=${planId}`)
        }
    }, [planId])

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(2, 15))
    }, [])

    const [googleError, setGoogleError] = useState<string | null>(null)
    const [googleLoading, setGoogleLoading] = useState(false)

    const handleGoogleSignup = async () => {
        setGoogleError(null)
        setGoogleLoading(true)
        // New Google users land on onboarding (see /auth/callback)
        const { error } = await createClient().auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
        })
        if (error) {
            setGoogleError(error.message)
            setGoogleLoading(false)
        }
    }

    const handleFormSubmit = async (answers: Record<string, any>) => {
        const { email, password, fullName } = answers
        setEmail(email)

        // The chosen plan + currency are saved to the user's metadata (survives email
        // confirmation). No checkout at signup — the trial starts without a card.
        // Company name is collected in onboarding.
        const { data, error } = await signUpUser(email, password, fullName, window.location.origin, planId, currency, perk?.code)

        if (error) {
            throw new Error(error)
        }
        if (data?.user) {
            console.log(`[Analytics] user_signed_up${planId ? `: plan=${planId}` : ''}`)
        }
        if (data?.user && data.session) {
            router.push('/onboarding')
        } else if (data?.user && !data.session) {
            setShowConfirmation(true)
        } else {
            router.push('/onboarding')
        }
    }

    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="w-full max-w-md p-10 bg-white/[0.02] border border-white/10 rounded-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#7B61FF] to-transparent" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#38BDF8] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(123,97,255,0.35)]">
                        <img src="/velodesk (2).png" alt="Velodesk" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-2xl font-['Outfit'] text-white mb-4">Check your email</h1>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        We sent a confirmation link to <strong className="text-white">{email}</strong>.
                        Click it to verify your email and finish setting up your account.
                        {planId && <> Your {PLAN_NAMES[planId]} selection is saved.</>}
                    </p>
                    <ResendConfirmation email={email} />
                    <Link href="/login" className="text-sm text-[#7B61FF] hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Left Panel: Signup Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between px-8 py-10 lg:px-16 lg:py-12 overflow-y-auto relative z-10">
                <Link href="/" className="flex items-center gap-3 shrink-0 mb-10">
                    <img src="/velodesk (2).png" alt="Velodesk" className="h-8 w-auto" />
                    <div className="flex flex-col justify-center">
                        <span className="font-orbitron font-bold text-sm tracking-[0.15em] text-white leading-none">VELODESK</span>
                    </div>
                </Link>

                <div className="w-full max-w-md mx-auto my-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {planId && (
                            <p className="mb-6 text-center text-sm text-gray-300">
                                Selected: <span className="text-white font-medium">{PLAN_NAMES[planId]}</span>
                                {' '}<span className="text-[#8A8A8A]">({currency}) · no card needed to start</span>{' '}
                                <Link href="/pricing" className="text-[#7B61FF] hover:text-white underline underline-offset-2 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]">
                                    Change
                                </Link>
                            </p>
                        )}
                        {sessionId && (
                            <FormEngine 
                                schema={schema}
                                sessionId={sessionId}
                                onSubmit={handleFormSubmit}
                            />
                        )}

                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            disabled={googleLoading}
                            className="w-full py-3.5 border border-white/10 rounded-xl hover:bg-white/5 text-white transition flex items-center justify-center gap-3 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {googleLoading ? 'Opening Google…' : 'Sign up with Google'}
                        </button>
                        {googleError && <p role="alert" className="mt-3 text-center text-sm text-red-400">{googleError}</p>}

                        <p className="text-center text-sm text-[#8A8A8A] mt-8">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#7B61FF] hover:text-white transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]">
                                Sign In
                            </Link>
                        </p>
                    </motion.div>
                </div>
                
                <div className="text-xs text-[#8A8A8A] font-mono flex items-center justify-between mt-10 shrink-0">
                    <span>© 2026 Velodesk</span>
                    <a href="mailto:support@crelligent.com" className="hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]">support@crelligent.com</a>
                </div>
            </div>

            {/* Right Panel: Value Prop */}
            <div className="hidden lg:flex w-[55%] bg-[#0a0c16] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#7B61FF]/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#38BDF8]/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 w-full max-w-lg p-12"
                >
                    <h2 className="text-4xl font-light text-white mb-6 font-['Outfit'] leading-tight">
                        Stop guessing.<br/>
                        <span className="font-medium bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] bg-clip-text text-transparent">Measure your PMF.</span>
                    </h2>
                    
                    <p className="text-gray-400 text-lg leading-relaxed mb-12">
                        Velodesk automatically connects to your existing tools to calculate the one metric investors actually care about.
                    </p>

                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Database className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Instant Integration</h4>
                                <p className="text-sm text-[#8A8A8A]">Connect Paystack or Stripe to calculate your score from real payment data. No code required.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <LineChart className="w-5 h-5 text-[#38BDF8]" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Board-Ready Reports</h4>
                                <p className="text-sm text-[#8A8A8A]">Export your PMF report as a PDF or share it through your data room.</p>
                            </div>
                        </div>
                    </div>

                    {/* What happens next — factual replacement for the former testimonial */}
                    <div className="mt-16 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-md">
                        <h3 className="text-xs text-gray-300 uppercase tracking-widest mb-5">What happens after you sign up</h3>
                        <ol className="space-y-4">
                            {[
                                'Tell us your company name and stage.',
                                'Connect your first data source: Paystack or Stripe.',
                                'Velodesk syncs your data and calculates your PMF Score.',
                                'Share the score with investors when you are ready.',
                            ].map((step, i) => (
                                <li key={step} className="flex gap-4 items-start">
                                    <span className="w-6 h-6 shrink-0 rounded-full border border-white/20 text-xs text-white flex items-center justify-center font-mono">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <SignupForm />
        </Suspense>
    )
}
