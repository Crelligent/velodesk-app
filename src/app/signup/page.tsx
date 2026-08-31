'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signUpUser } from '@/app/actions'
import { FormEngine, FormSchema } from '@/components/forms/FormEngine'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Database, LineChart, Sparkles } from 'lucide-react'

const signupSchema: FormSchema = {
    id: 'velodesk-signup-form-v1',
    title: 'Get Early Access',
    description: 'No credit card required. Connect your data in minutes.',
    fields: [
        {
            id: 'fullName',
            type: 'text',
            label: 'Full Name',
            placeholder: 'John Doe',
            required: true
        },
        {
            id: 'companyName',
            type: 'text',
            label: 'Company',
            placeholder: 'Acme Inc.',
            required: false
        },
        {
            id: 'email',
            type: 'email',
            label: 'Work Email',
            placeholder: 'you@company.com',
            required: true
        },
        {
            id: 'password',
            type: 'password',
            label: 'Password',
            placeholder: 'Min. 8 characters',
            required: true
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

export default function SignupPage() {
    const [sessionId, setSessionId] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [email, setEmail] = useState('')
    const router = useRouter()
    // removed

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(2, 15))
    }, [])

    const handleFormSubmit = async (answers: Record<string, any>) => {
        const { email, password, fullName, companyName } = answers
        setEmail(email)

        const { data, error } = await signUpUser(email, password, fullName, companyName, window.location.origin)

        if (error) {
            throw new Error(error)
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
                        We sent a secure confirmation link to <strong className="text-white">{email}</strong>. 
                        Click the link inside to verify your identity and access your dashboard.
                    </p>
                    <Link href="/login" className="text-sm text-[#7B61FF] hover:text-white transition">
                        Ã¢â€ Â Back to Sign In
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
                        {sessionId && (
                            <FormEngine 
                                schema={signupSchema}
                                sessionId={sessionId}
                                onSubmit={handleFormSubmit}
                            />
                        )}

                        <p className="text-center text-sm text-gray-500 mt-8">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#7B61FF] hover:text-white transition">
                                Sign In
                            </Link>
                        </p>
                    </motion.div>
                </div>
                
                <div className="text-xs text-gray-600 font-mono flex items-center justify-between mt-10 shrink-0">
                    <span>Ã‚Â© 2026 Velodesk</span>
                    <a href="mailto:support@velodesk.com" className="hover:text-gray-400">support@velodesk.com</a>
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
                                <p className="text-sm text-gray-500">Connect Stripe, Mixpanel, and 17+ tools in under 5 minutes without writing any code.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <LineChart className="w-5 h-5 text-[#38BDF8]" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Board-Ready Reports</h4>
                                <p className="text-sm text-gray-500">Export beautiful, certified PMF reports directly into your slide decks and dataroom.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-md">
                        <div className="flex gap-4 items-start">
                            <img src="/avatar-placeholder.png" alt="Founder" className="w-10 h-10 rounded-full bg-white/10" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23333"/><text x="50%" y="50%" fill="%23fff" font-size="14" dy=".3em" text-anchor="middle">F</text></svg>' }} />
                            <div>
                                <p className="text-sm text-gray-300 italic mb-3">
                                    "Velodesk entirely changed how we communicate with our board. The PMF Score cut our reporting time by 90%."
                                </p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Sarah J. - Series A Founder</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
