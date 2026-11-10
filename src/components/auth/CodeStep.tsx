'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-react'

/** Must match Supabase: Auth > Email > Email OTP Length. Used for sign-in and sign-up codes. */
export const CODE_LENGTH = 8

export const primaryButton =
    'flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3.5 font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
export const linkClass =
    'rounded-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export function CodeStep({
    email, busy, error, cooldown, onSubmit, onResend, onBack,
    title = 'Check your email',
    submitLabel = 'Sign in',
    busyLabel = 'Signing in…',
    backLabel = 'Use a different email',
    note,
}: {
    email: string
    busy: boolean
    error: string | null
    cooldown: number
    onSubmit: (code: string) => Promise<boolean>
    onResend: () => void
    onBack: () => void
    title?: string
    submitLabel?: string
    busyLabel?: string
    backLabel?: string
    note?: React.ReactNode
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
            <h1 className="mt-6 text-center font-display text-3xl text-text">{title}</h1>
            <p className="mt-3 text-center text-text-muted">
                Enter the {CODE_LENGTH}-digit code we sent to <span className="inline-block max-w-full break-words text-text">{email}</span>
            </p>
            {note && <p className="mt-2 text-center text-sm text-text-muted">{note}</p>}

            <form
                onSubmit={(e) => { e.preventDefault(); if (code.length === CODE_LENGTH) void submit(code) }}
                className="mt-10"
            >
                <fieldset disabled={busy}>
                    <legend className="sr-only">{CODE_LENGTH}-digit code</legend>
                    <div className="flex justify-center gap-1.5 sm:gap-2.5">
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
                                className={`h-12 w-9 rounded-md border bg-surface text-center font-mono text-xl text-text tabular-nums transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:h-14 sm:w-12 sm:text-2xl ${error ? 'border-danger' : 'border-border-strong'}`}
                            />
                        ))}
                    </div>
                </fieldset>

                {error && <div className="mt-5"><ErrorNote message={error} /></div>}

                <button type="submit" disabled={busy || code.length < CODE_LENGTH} className={`mt-10 ${primaryButton}`}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {busy ? busyLabel : submitLabel}
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
            <p className="mt-2 text-center text-xs text-text-muted">Check your spam or promotions folder too.</p>

            <p className="mt-8 text-center">
                <button type="button" onClick={onBack} className={`inline-flex items-center gap-1.5 text-sm ${linkClass}`}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
                </button>
            </p>
        </>
    )
}

export function ErrorNote({ message }: { message: string }) {
    return (
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <span>{message}</span>
        </p>
    )
}
