// API Keys Library
// Handles API key generation, validation, and usage tracking

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Types
export interface APIKey {
    id: string
    user_id: string
    organization_id: string | null
    name: string
    key_prefix: string
    last_used_at: string | null
    usage_count: number
    rate_limit: number
    scopes: string[]
    expires_at: string | null
    revoked_at: string | null
    created_at: string
}

export interface APIKeyWithSecret extends APIKey {
    secret: string // Only returned on creation
}

// Generate API key with format: vd_xxxxxxxxxxxxxxxxxxxx
export function generateAPIKey(): { key: string; hash: string; prefix: string } {
    const bytes = crypto.randomBytes(24)
    const key = `vd_${bytes.toString('base64url')}`
    const hash = crypto.createHash('sha256').update(key).digest('hex')
    const prefix = key.substring(0, 10)

    return { key, hash, prefix }
}

// Hash a key for comparison
export function hashAPIKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex')
}

// Create a new API key
export async function createAPIKey(
    userId: string,
    name: string,
    options?: {
        organizationId?: string
        scopes?: string[]
        rateLimit?: number
        expiresInDays?: number
    }
): Promise<{ success: boolean; apiKey?: APIKeyWithSecret; error?: string }> {
    const supabase = await createClient()

    const { key, hash, prefix } = generateAPIKey()

    const expiresAt = options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

    const { data, error } = await supabase
        .from('api_keys')
        .insert({
            user_id: userId,
            organization_id: options?.organizationId || null,
            name,
            key_hash: hash,
            key_prefix: prefix,
            scopes: options?.scopes || ['read'],
            rate_limit: options?.rateLimit || 1000,
            expires_at: expiresAt,
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    return {
        success: true,
        apiKey: {
            ...data,
            secret: key, // Only returned once!
        },
    }
}

// List user's API keys (without secrets)
export async function listAPIKeys(userId: string): Promise<APIKey[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching API keys:', error)
        return []
    }

    return data || []
}

// Validate an API key
export async function validateAPIKey(key: string): Promise<{
    valid: boolean
    apiKey?: APIKey
    error?: string
}> {
    if (!key.startsWith('vd_')) {
        return { valid: false, error: 'Invalid API key format' }
    }

    const supabase = await createClient()
    const hash = hashAPIKey(key)

    const { data: apiKey, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', hash)
        .is('revoked_at', null)
        .single()

    if (error || !apiKey) {
        return { valid: false, error: 'Invalid API key' }
    }

    // Check expiration
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        return { valid: false, error: 'API key has expired' }
    }

    // Update last used
    await supabase
        .from('api_keys')
        .update({
            last_used_at: new Date().toISOString(),
            usage_count: apiKey.usage_count + 1,
        })
        .eq('id', apiKey.id)

    return { valid: true, apiKey }
}

// Revoke an API key
export async function revokeAPIKey(keyId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId)
        .eq('user_id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Log API usage
export async function logAPIUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    ipAddress?: string
): Promise<void> {
    const supabase = await createClient()

    await supabase.from('api_usage_log').insert({
        api_key_id: apiKeyId,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        ip_address: ipAddress || null,
    })
}

// Check rate limit
export async function checkRateLimit(apiKeyId: string, limit: number): Promise<{
    allowed: boolean
    remaining: number
    resetAt: Date
}> {
    const supabase = await createClient()

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const resetAt = new Date(Date.now() + 60 * 60 * 1000)

    const { count, error } = await supabase
        .from('api_usage_log')
        .select('*', { count: 'exact', head: true })
        .eq('api_key_id', apiKeyId)
        .gt('created_at', oneHourAgo.toISOString())

    if (error) {
        // If check fails, allow the request
        return { allowed: true, remaining: limit, resetAt }
    }

    const used = count || 0
    const remaining = Math.max(0, limit - used)

    return {
        allowed: remaining > 0,
        remaining,
        resetAt,
    }
}

// Get API usage stats
export async function getAPIUsageStats(userId: string, days: number = 30): Promise<{
    totalRequests: number
    requestsByEndpoint: Record<string, number>
    requestsByDay: { date: string; count: number }[]
}> {
    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get user's API key IDs
    const { data: keys } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', userId)

    if (!keys || keys.length === 0) {
        return { totalRequests: 0, requestsByEndpoint: {}, requestsByDay: [] }
    }

    const keyIds = keys.map(k => k.id)

    // Get usage logs
    const { data: logs } = await supabase
        .from('api_usage_log')
        .select('*')
        .in('api_key_id', keyIds)
        .gt('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

    if (!logs || logs.length === 0) {
        return { totalRequests: 0, requestsByEndpoint: {}, requestsByDay: [] }
    }

    const requestsByEndpoint: Record<string, number> = {}
    const requestsByDayMap: Record<string, number> = {}

    logs.forEach(log => {
        // By endpoint
        requestsByEndpoint[log.endpoint] = (requestsByEndpoint[log.endpoint] || 0) + 1

        // By day
        const day = log.created_at.split('T')[0]
        requestsByDayMap[day] = (requestsByDayMap[day] || 0) + 1
    })

    const requestsByDay = Object.entries(requestsByDayMap).map(([date, count]) => ({
        date,
        count,
    }))

    return {
        totalRequests: logs.length,
        requestsByEndpoint,
        requestsByDay,
    }
}
