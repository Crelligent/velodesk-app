import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getContacts, transformContact } from '@/lib/hubspot'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch contacts from HubSpot
        const contacts = await getContacts(100)

        // Transform to Velodesk lead format
        const leads = contacts.map(transformContact)

        // Sort by score (highest first)
        leads.sort((a, b) => b.score - a.score)

        return NextResponse.json({
            leads,
            total: leads.length,
            source: 'hubspot',
        })
    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}
