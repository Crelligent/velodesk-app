'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { FormEngine, FormSchema } from '@/components/forms/FormEngine'

const signupSchema: FormSchema = {
    id: 'velodesk-signup-form-v1',
    title: 'Start your free trial',
    description: 'No credit card required. 14-day free trial.',
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
    const supabase = createClient()

    useEffect(() => {
        // Generate a random session ID for tracking drop-offs and partial submissions
        setSessionId(Math.random().toString(36).substring(2, 15))
    }, [])

    const handleFormSubmit = async (answers: Record<string, any>) => {
        const { email, password, fullName, companyName } = answers
        setEmail(email)

        // 1. Authenticate / Create User in Supabase
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
            throw new Error(error.message)
        }

        // 2. Commit Final Submission Analytics via our new engine
        await fetch('/api/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_id: signupSchema.id,
                session_id: sessionId,
                answers: answers
            })
        })

        // 3. Routing
        if (data.user && data.session) {
            router.push('/onboarding')
        } else if (data.user && !data.session) {
            setShowConfirmation(true)
        } else {
            router.push('/onboarding')
        }
    }

    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md p-8 bg-white/[0.02] border border-white/10 rounded-lg text-center">
                    <h1 className="text-2xl font-light mb-4">Check your email</h1>
                    <p className="text-gray-400">We sent a confirmation link to {email}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-12">
                    <Logo />
                </div>
                <div className="p-8 bg-white/[0.02] border border-white/10 rounded-lg">
                    {sessionId && (
                        <FormEngine 
                            schema={signupSchema}
                            sessionId={sessionId}
                            onSubmit={handleFormSubmit}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

