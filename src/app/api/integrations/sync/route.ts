import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SyncRequest {
    provider: string
    accessToken?: string
}

export async function POST(request: NextRequest) {
    try {
        const { provider }: SyncRequest = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the stored token for this integration
        const { data: integration, error: tokenError } = await supabase
            .from('integration_tokens')
            .select('access_token, refresh_token')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .single()

        if (tokenError || !integration?.access_token) {
            return NextResponse.json(
                { error: 'Integration not connected' },
                { status: 404 }
            )
        }

        let syncResult: { success: boolean; recordsProcessed: number; data?: unknown }

        // Sync based on provider
        switch (provider) {
            case 'hubspot':
                syncResult = await syncHubSpot(integration.access_token)
                break

            case 'stripe':
                syncResult = await syncStripe(integration.access_token)
                break

            case 'mixpanel':
                syncResult = await syncMixpanel(integration.access_token)
                break

            case 'intercom':
                syncResult = await syncIntercom(integration.access_token)
                break

            default:
                return NextResponse.json(
                    { error: `Sync not implemented for ${provider}` },
                    { status: 400 }
                )
        }

        // Update last sync timestamp
        await supabase
            .from('integration_tokens')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('provider', provider)

        return NextResponse.json(syncResult)
    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json(
            { error: 'Sync failed', success: false },
            { status: 500 }
        )
    }
}

// Provider-specific sync functions

async function syncHubSpot(accessToken: string) {
    try {
        // Fetch contacts from HubSpot
        const response = await fetch(
            'https://api.hubapi.com/crm/v3/objects/contacts?limit=100',
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )

        if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status}`)
        }

        const data = await response.json()
        const contacts = data.results || []

        // Calculate engagement metrics
        const metrics = {
            totalContacts: contacts.length,
            recentlyCreated: contacts.filter((c: { createdAt: string }) =>
                new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length,
        }

        return {
            success: true,
            recordsProcessed: contacts.length,
            data: metrics,
        }
    } catch (error) {
        console.error('HubSpot sync error:', error)
        return { success: false, recordsProcessed: 0 }
    }
}

async function syncStripe(accessToken: string) {
    try {
        // For Stripe Connect, we'd use the connected account's credentials
        // For now, use the platform's API to get revenue data
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

        // Get subscription data
        const subscriptions = await stripe.subscriptions.list({ limit: 100 })

        // Get charges for revenue
        const charges = await stripe.charges.list({ limit: 100 })

        // Calculate metrics
        const mrr = subscriptions.data.reduce((sum, sub) => {
            if (sub.status === 'active' && sub.items.data[0]?.price?.unit_amount) {
                return sum + (sub.items.data[0].price.unit_amount / 100)
            }
            return sum
        }, 0)

        const totalRevenue = charges.data.reduce((sum, charge) => {
            if (charge.status === 'succeeded' && charge.paid) {
                return sum + (charge.amount / 100)
            }
            return sum
        }, 0)

        return {
            success: true,
            recordsProcessed: subscriptions.data.length + charges.data.length,
            data: {
                mrr,
                totalRevenue,
                activeSubscriptions: subscriptions.data.filter(s => s.status === 'active').length,
            },
        }
    } catch (error) {
        console.error('Stripe sync error:', error)
        return { success: false, recordsProcessed: 0 }
    }
}

async function syncMixpanel(accessToken: string) {
    try {
        // Mixpanel requires project ID and service account
        // This is a simplified example
        const response = await fetch(
            'https://mixpanel.com/api/2.0/engage',
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(accessToken + ':').toString('base64')}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error(`Mixpanel API error: ${response.status}`)
        }

        const data = await response.json()

        return {
            success: true,
            recordsProcessed: data.results?.length || 0,
            data: {
                totalUsers: data.total || 0,
            },
        }
    } catch (error) {
        console.error('Mixpanel sync error:', error)
        return { success: false, recordsProcessed: 0 }
    }
}

async function syncIntercom(accessToken: string) {
    try {
        // Fetch users from Intercom
        const response = await fetch('https://api.intercom.io/users', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Intercom API error: ${response.status}`)
        }

        const data = await response.json()
        const users = data.users || []

        // Calculate NPS/satisfaction from conversations
        const conversationsRes = await fetch('https://api.intercom.io/conversations', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        })

        const convData = await conversationsRes.json()
        const conversations = convData.conversations || []

        return {
            success: true,
            recordsProcessed: users.length + conversations.length,
            data: {
                totalUsers: users.length,
                totalConversations: conversations.length,
            },
        }
    } catch (error) {
        console.error('Intercom sync error:', error)
        return { success: false, recordsProcessed: 0 }
    }
}
