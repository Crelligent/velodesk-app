'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signUpUser } from '@/app/actions'
import { FormEngine, FormSchema } from '@/components/forms/FormEngine'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Database, LineChart, Sparkles } from 'lucide-react'

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
            label: 'Work Email',
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

    useEffect(() => {
        if (planId) {
            console.log(`[Analytics] signup_started: plan=${planId}`)
        }
    }, [planId])

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(2, 15))
    }, [])

    const handleFormSubmit = async (answers: Record<string, any>) => {
        const { email, password, fullName } = answers
        setEmail(email)

        // The chosen plan + currency are saved to the user's metadata (survives email
        // confirmation). No checkout at signup — the trial starts without a card.
        // Company name is collected in onboarding.
        const { data, error } = await signUpUser(email, password, fullName, window.location.origin, planId, currency)

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
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-[#38BDF8]" />
                    </div>
                    <h1 className="text-2xl font-['Outfit'] text-white mb-4">Check your email</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        We sent a confirmation link to <strong className="text-white">{email}</strong>.
                        Click it to verify your email and finish setting up your account.
                        {planId && <> Your {PLAN_NAMES[planId]} selection is saved.</>}
                    </p>
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
                                schema={signupSchema}
                                sessionId={sessionId}
                                onSubmit={handleFormSubmit}
                            />
                        )}

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
                    <a href="mailto:support@velodesk.com" className="hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]">support@velodesk.com</a>
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
