/**
 * Privacy choices: the optional, opt-in switches a user controls (GDPR consent).
 * Pure module: safe to import from client components.
 */
export const CONSENT_COOKIE = 'vd_consent' // 'granted' | 'denied': site measurement (GTM, Apollo tracker)
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export interface PrivacyChoices {
    benchmark: boolean
    productEmails: boolean
    usageAnalytics: boolean
}

export const NO_CHOICES: PrivacyChoices = { benchmark: false, productEmails: false, usageAnalytics: false }

export function fromRow(row: { benchmark?: boolean | null; product_emails?: boolean | null; usage_analytics?: boolean | null } | null): PrivacyChoices {
    return {
        benchmark: row?.benchmark === true,
        productEmails: row?.product_emails === true,
        usageAnalytics: row?.usage_analytics === true,
    }
}

/** Only internal paths, so ?next= can't send someone off-site. */
export function safeReturnPath(next: string | null | undefined, fallback = '/dashboard'): string {
    return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback
}
