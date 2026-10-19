'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendSignInCode, startPasswordSignIn, verifySignInCode } from './actions'

type Step = 'password' | 'email' | 'code'
const RESEND_SECONDS = 60
const CODE_LENGTH = 6

const inputClass =
    'w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-text placeholder:text-text-dim transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
const primaryButton =
    'flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3.5 font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
const linkClass =
    'rounded-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export default function LoginPage() {
    return (
        <Suspense fallback={<Shell><div className="h-80" /></Shell>}>
            <LoginFlow />
        </Suspense>
    )
}

function LoginFlow() {
    const router = useRouter()
    const params = useSearchParams()
    const next = params.get('next')

    const [step, setStep] = useState<Step>('password')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(
        params.get('error') ? 'That sign-in link did not work. Please sign in again.' : null,
    )
    const [busy, setBusy] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
        return () => clearTimeout(t)
    }, [cooldown])

    const goToCode = () => {
        setStep('code')
        setCooldown(RESEND_SECONDS)
    }

    const handlePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setBusy(true)
        const res = await startPasswordSignIn(email, password, next)
        setBusy(false)
        if (!res.ok) return setError(res.error)
        if (res.step === 'done') return router.push(res.redirectTo)
        setPassword('')
        goToCode()
    }

    const handleEmailOnly = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setBusy(true)
        const res = await sendSignInCode(email)
        setBusy(false)
        if (!res.ok) return setError(res.error)
        goToCode()
    }

    const handleResend = async () => {
        setError(null)
        const res = await sendSignInCode(email)
        if (!res.ok) {
            setError(res.error)
            if (res.retryAfter) setCooldown(res.retryAfter)
            return
        }
        setCooldown(RESEND_SECONDS)
    }

    const handleVerify = async (code: string): Promise<boolean> => {
        setError(null)
        setBusy(true)
        const res = await verifySignInCode(email, code, next)
        if (!res.ok) {
            setBusy(false)
            setError(res.error)
            return false
        }
        if (res.step === 'done') router.push(res.redirectTo)
        return true
    }

    const handleGoogle = async () => {
        setError(null)
        setBusy(true)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) {
            setError('Google sign-in did not start. Please try again.')
            setBusy(false)
        }
    }

    const switchTo = (s: Step) => {
        setError(null)
        setStep(s)
    }

    return (
        <Shell>
            {step === 'code' ? (
                <CodeStep
                    email={email}
                    busy={busy}
                    error={error}
                    cooldown={cooldown}
                    onSubmit={handleVerify}
                    onResend={handleResend}
                    onBack={() => switchTo('password')}
                />
            ) : (
                <>
                    <h1 className="text-center font-display text-3xl text-text">Sign in to your account</h1>
                    <p className="mt-3 text-center text-text-muted">
                        {step === 'password'
                            ? 'Enter your email and password. We’ll then email you a 6-digit code.'
                            : 'Enter your email and we’ll send you a 6-digit sign-in code.'}
                    </p>

                    <form onSubmit={step === 'password' ? handlePassword : handleEmailOnly} className="mt-10 space-y-5" noValidate>
                        <div>
                            <label htmlFor="login-email" className="mb-2 block text-sm text-text-muted">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        {step === 'password' && (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label htmlFor="login-password" className="block text-sm text-text-muted">Password</label>
                                    <Link href="/forgot-password" className={`text-sm ${linkClass}`}>Forgot password?</Link>
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        )}

                        {error && <ErrorNote message={error} />}

                        <button type="submit" disabled={busy} className={primaryButton}>
                            {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                            {busy ? 'Please wait…' : step === 'password' ? 'Continue' : 'Email me a code'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-text-muted">
                        {step === 'password' ? (
                            <button type="button" onClick={() => switchTo('email')} className={linkClass}>
                                Sign in with an email code instead
                            </button>
                        ) : (
                            <button type="button" onClick={() => switchTo('password')} className={linkClass}>
                                Sign in with your password instead
                            </button>
                        )}
                    </p>

                    <div className="my-8 flex items-center gap-4" aria-hidden="true">
                        <div className="h-px flex-1 bg-border-strong" />
                        <span className="text-xs uppercase tracking-wide text-text-muted">or</span>
                        <div className="h-px flex-1 bg-border-strong" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={busy}
                        className="flex w-full items-center justify-center gap-3 rounded-md border border-border-strong px-5 py-3.5 text-text transition-colors hover:bg-surface-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    >
                        <GoogleMark />
                        Continue with Google
                    </button>

                    <p className="mt-8 text-center text-sm text-text-muted">
                        New to Velodesk? <Link href="/signup" className={linkClass}>Start your free trial</Link>
                    </p>
                </>
            )}
        </Shell>
    )
}

function CodeStep({
    email, busy, error, cooldown, onSubmit, onResend, onBack,
}: {
    email: string
    busy: boolean
    error: string | null
    cooldown: number
    onSubmit: (code: string) => Promise<boolean>
    onResend: () => void
    onBack: () => void
}) {
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
    const refs = useRef<(HTMLInputElement | null)[]>([])
    const code = digits.join('')

    useEffect(() => refs.current[0]?.focus(), [])

    // Clear the boxes after a wrong code so the next attempt starts fresh.
    const submit = async (value: string) => {
        if (await onSubmit(value)) return
        setDigits(Array(CODE_LENGTH).fill(''))
        requestAnimationFrame(() => refs.current[0]?.focus())
    }

    const fill = (start: number, value: string) => {
        const chars = value.replace(/\D/g, '').slice(0, CODE_LENGTH - start).split('')
        if (!chars.length) return
        const nextDigits = [...digits]
        chars.forEach((c, i) => (nextDigits[start + i] = c))
        setDigits(nextDigits)
        const joined = nextDigits.join('')
        refs.current[Math.min(start + chars.length, CODE_LENGTH - 1)]?.focus()
        if (joined.length === CODE_LENGTH && !nextDigits.includes('')) void submit(joined)
    }

    const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault()
            const nextDigits = [...digits]
            if (nextDigits[i]) nextDigits[i] = ''
            else if (i > 0) {
                nextDigits[i - 1] = ''
                refs.current[i - 1]?.focus()
            }
            setDigits(nextDigits)
        } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
        else if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus()
    }

    return (
        <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
                <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-center font-display text-3xl text-text">Check your email</h1>
            <p className="mt-3 text-center text-text-muted">
                Enter the 6-digit code we sent to <span className="break-all text-text">{email}</span>
            </p>

            <form
                onSubmit={(e) => { e.preventDefault(); if (code.length === CODE_LENGTH) void submit(code) }}
                className="mt-10"
            >
                <fieldset disabled={busy}>
                    <legend className="sr-only">6-digit sign-in code</legend>
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={(el) => { refs.current[i] = el }}
                                value={d}
                                onChange={(e) => fill(i, e.target.value)}
                                onKeyDown={(e) => onKeyDown(i, e)}
                                onPaste={(e) => { e.preventDefault(); fill(0, e.clipboardData.getData('text')) }}
                                onFocus={(e) => e.target.select()}
                                inputMode="numeric"
                                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                                maxLength={CODE_LENGTH}
                                aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                                aria-invalid={!!error}
                                className={`h-14 w-11 rounded-md border bg-surface text-center font-mono text-2xl text-text tabular-nums transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:h-16 sm:w-14 ${error ? 'border-danger' : 'border-border-strong'}`}
                            />
                        ))}
                    </div>
                </fieldset>

                {error && <div className="mt-5"><ErrorNote message={error} /></div>}

                <button type="submit" disabled={busy || code.length < CODE_LENGTH} className={`mt-10 ${primaryButton}`}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {busy ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted" aria-live="polite">
                {cooldown > 0 ? (
                    <>Resend code in <span className="font-mono tabular-nums text-text">0:{String(cooldown).padStart(2, '0')}</span></>
                ) : (
                    <button type="button" onClick={onResend} className={linkClass}>Resend code</button>
                )}
                {' '}or{' '}
                <a href="mailto:support@crelligent.com" className={linkClass}>contact support</a>
            </p>

            <p className="mt-8 text-center">
                <button type="button" onClick={onBack} className={`inline-flex items-center gap-1.5 text-sm ${linkClass}`}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Use a different email
                </button>
            </p>
        </>
    )
}

function ErrorNote({ message }: { message: string }) {
    return (
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <span>{message}</span>
        </p>
    )
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
            <header className="relative z-10 flex justify-center px-4 pt-10">
                <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small static logo */}
                    <img src="/velodesk (2).png" alt="" className="h-8 w-auto" />
                    <span className="font-display text-lg font-light uppercase tracking-[0.35em] text-text">Velodesk</span>
                </Link>
            </header>

            <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-48 pt-16">
                {children}
            </section>

            <BottomScene />
        </main>
    )
}

/** Decorative: a quiet skyline of score bars with the PMF line rising across them. */
function BottomScene() {
    const bars = [38, 62, 46, 80, 54, 96, 70, 112, 84, 128, 98, 140, 110, 150, 122, 132, 104, 146, 92, 120, 76, 102, 58, 86, 44, 64]
    const w = 1440
    const step = w / bars.length
    const line = bars.map((h, i) => `${i === 0 ? 'M' : 'L'}${(i + 0.5) * step},${200 - h - 24}`).join(' ')
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full sm:h-52"
            viewBox={`0 0 ${w} 200`}
            preserveAspectRatio="xMidYMax slice"
        >
            {bars.map((h, i) => (
                <rect
                    key={i}
                    x={i * step + step * 0.18}
                    y={200 - h}
                    width={step * 0.64}
                    height={h}
                    rx={6}
                    className="fill-surface-2 stroke-border-strong"
                    strokeWidth={1}
                />
            ))}
            <path d={line} fill="none" className="stroke-accent" strokeWidth={2} strokeOpacity={0.45} strokeLinejoin="round" />
        </svg>
    )
}

function GoogleMark() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}
