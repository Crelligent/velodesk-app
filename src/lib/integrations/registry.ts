/**
 * Server-side registry: provider id -> module implementing validate() + sync().
 * The UI catalog (fields, flags) lives in src/lib/integrations.ts.
 */
import { getIntegrationByProvider } from '@/lib/integrations'
import type { Credentials, ProviderModule } from './signals'
import * as stripe from './stripe'
import * as paystack from './paystack'
import * as chargebee from './chargebee'
import * as paddle from './paddle'
import * as mixpanel from './mixpanel'
import * as amplitude from './amplitude'
import * as posthog from './posthog'
import * as hubspot from './hubspot'
import * as pipedrive from './pipedrive'
import * as close from './close'
import * as intercom from './intercom'
import * as zendesk from './zendesk'
import * as typeform from './typeform'
import * as canny from './canny'

export const PROVIDER_MODULES: Record<string, ProviderModule> = {
    stripe, paystack, chargebee, paddle,
    mixpanel, amplitude, posthog,
    hubspot, pipedrive, close,
    intercom, zendesk, typeform, canny,
}

export function getProviderModule(provider: string): ProviderModule | null {
    return Object.prototype.hasOwnProperty.call(PROVIDER_MODULES, provider) ? PROVIDER_MODULES[provider] : null
}

/**
 * access_token holds a JSON object of credential fields. Rows saved before this
 * format (a bare key/token string) map to the provider's first credential field;
 * OAuth rows (Stripe) map to { accessToken }.
 */
export function parseCredentials(provider: string, raw: string | null | undefined): Credentials {
    if (!raw) return {}
    try {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return Object.fromEntries(
                Object.entries(parsed as Record<string, unknown>)
                    .filter((e): e is [string, string] => typeof e[1] === 'string')
            )
        }
    } catch {
        // not JSON: legacy single-value credential
    }
    const primary = getIntegrationByProvider(provider)?.credentialFields?.[0]?.key ?? 'accessToken'
    return { [primary]: raw }
}
