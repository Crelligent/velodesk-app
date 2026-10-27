'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CONSENT_COOKIE, CONSENT_MAX_AGE } from '@/lib/privacy'

/**
 * Site measurement only after consent (GDPR / ePrivacy): Google Tag Manager and the
 * Apollo website tracker load once the visitor accepts. Until they choose, a banner asks.
 * The choice lives in the vd_consent cookie, also set by the in-app privacy choices.
 */
const GTM_ID = 'GTM-N2BXLJ76'
const APOLLO_APP_ID = '6a900322ed90b0001c04ad81'
const CLARITY_ID = 'z49tp5d9v3'
/** Session recording stays off signed-in pages: they show founders' business data. */
const NO_RECORDING = ['/dashboard', '/investor', '/welcome', '/billing', '/onboarding', '/login', '/signup', '/auth']

function readConsent(): 'granted' | 'denied' | null {
    const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`))
    return (m?.[1] as 'granted' | 'denied' | undefined) ?? null
}

function writeConsent(v: 'granted' | 'denied') {
    document.cookie = `${CONSENT_COOKIE}=${v}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax; Secure`
    window.dispatchEvent(new Event('vd:consent'))
}

const subscribe = (cb: () => void) => {
    window.addEventListener('vd:consent', cb)
    return () => window.removeEventListener('vd:consent', cb)
}
const snapshot = () => readConsent() ?? 'unset'
const serverSnapshot = () => 'server' as const

let clarityLoaded = false
function loadClarity() {
    if (clarityLoaded) return
    clarityLoaded = true
    const w = window as unknown as { clarity?: ((...a: unknown[]) => void) & { q?: unknown[][] } }
    w.clarity = w.clarity || Object.assign((...a: unknown[]) => { (w.clarity!.q = w.clarity!.q || []).push(a) }, {})
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`
    document.head.appendChild(s)
    // The visitor has already accepted measurement; tell Clarity (required for EEA/UK visitors)
    w.clarity('consent')
}

let loaded = false
function loadMeasurement() {
    if (loaded) return
    loaded = true
    const w = window as unknown as { dataLayer: unknown[]; trackingFunctions?: { onLoad: (o: { appId: string }) => void } }
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const gtm = document.createElement('script')
    gtm.async = true
    gtm.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
    document.head.appendChild(gtm)

    const apollo = document.createElement('script')
    apollo.async = true
    apollo.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${Math.random().toString(36).slice(2, 9)}`
    apollo.onload = () => w.trackingFunctions?.onLoad({ appId: APOLLO_APP_ID })
    document.head.appendChild(apollo)
}

/** Lets a "Change cookie choices" link reopen the banner. */
export function reopenCookieChoices() {
    window.dispatchEvent(new Event('vd:cookie-choices'))
}

export function ConsentScripts() {
    const pathname = usePathname()
    const consent = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
    const [reopened, setReopened] = useState(false)

    useEffect(() => {
        if (consent !== 'granted') return
        loadMeasurement()
        // Clarity records sessions: public pages only. Once loaded it can't be unloaded, so a
        // visitor who lands on a public page and then signs in is masked by the app layouts.
        if (!NO_RECORDING.some(p => pathname?.startsWith(p))) loadClarity()
    }, [consent, pathname])

    useEffect(() => {
        const reopen = () => setReopened(true)
        window.addEventListener('vd:cookie-choices', reopen)
        return () => window.removeEventListener('vd:cookie-choices', reopen)
    }, [])

    const ask = consent === 'unset' || reopened
    // The first-run privacy screen asks the same question itself
    if (!ask || pathname?.startsWith('/welcome/privacy')) return null

    const choose = (v: 'granted' | 'denied') => {
        writeConsent(v)
        setReopened(false)
        // A previously granted choice that is now denied takes full effect on the next page load
    }

    return (
        <div role="region" aria-label="Cookie choices" className="fixed inset-x-0 bottom-0 z-[100] p-4">
            <div className="mx-auto max-w-3xl bg-surface border border-border-strong rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-2xl">
                <p className="text-sm text-text flex-1">
                    We&apos;d like to use cookies to measure how this site is used (Google Tag Manager, Apollo and Microsoft Clarity, which records visits to our public pages). They only load if you accept. <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                </p>
                <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => choose('denied')}
                        className="px-4 py-2 border border-border-strong text-sm text-text rounded-md hover:bg-surface-2 transition">Decline</button>
                    <button type="button" onClick={() => choose('granted')}
                        className="px-4 py-2 bg-accent text-on-accent text-sm font-medium rounded-md hover:bg-accent-hover transition">Accept</button>
                </div>
            </div>
        </div>
    )
}
