import { INTEGRATIONS } from '@/lib/integrations'

/** Integrations that connect and sync today. The homepage only ever shows these. */
export const LIVE_INTEGRATIONS = INTEGRATIONS.filter((i) => i.syncSupported)

export const LIVE_COUNT = LIVE_INTEGRATIONS.length

export type LiveIntegration = (typeof LIVE_INTEGRATIONS)[number]
