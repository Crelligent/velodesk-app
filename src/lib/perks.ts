/**
 * Partner perks: founders who arrive through a partner or perks marketplace get a
 * longer free trial than the public 14 days. Each partner has its own code so
 * sign-ups can be attributed (stored as user_metadata.perk_code).
 *
 * Flow: /perks/<code> landing page -> /api/perks/claim?code=<code> (sets a cookie)
 * -> /signup?perk=<code>. The code is saved to user metadata at email sign-up and
 * read from the cookie for Google sign-up; ensureTrial() applies the longer trial
 * the first time a trial is created. It never extends an existing trial.
 *
 * Pure module: safe to import from client components.
 */

export const PERK_COOKIE = 'vd_perk'
export const PERK_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
export const PERK_TRIAL_DAYS = 90

export interface Perk {
    /** Shown on the landing page and signup form: "for <partner> founders" */
    partner: string
}

export const PERKS: Record<string, Perk> = {
    posthog: { partner: 'PostHog' },
    mixpanel: { partner: 'Mixpanel' },
    paystack: { partner: 'Paystack' },
    hubspot: { partner: 'HubSpot for Startups' },
    google: { partner: 'Google for Startups' },
    vc4a: { partner: 'VC4A' },
    cchub: { partner: 'CcHub' },
    vestbee: { partner: 'Vestbee' },
    openvc: { partner: 'OpenVC' },
    f6s: { partner: 'F6S' },
    creditforstartups: { partner: 'Credit for Startups' },
    indiehackers: { partner: 'Indie Hackers' },
}

/** Returns the lower-cased code if it is a known perk, otherwise null. */
export function normalisePerk(code: unknown): string | null {
    if (typeof code !== 'string') return null
    const clean = code.trim().toLowerCase()
    return Object.prototype.hasOwnProperty.call(PERKS, clean) ? clean : null
}

export function getPerk(code: unknown): (Perk & { code: string }) | null {
    const clean = normalisePerk(code)
    return clean ? { code: clean, ...PERKS[clean] } : null
}
