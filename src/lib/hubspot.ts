import { Client } from '@hubspot/api-client'

// Initialize HubSpot client
export const hubspotClient = new Client({
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
})

// Fetch contacts from HubSpot
export async function getContacts(limit = 50) {
    try {
        const response = await hubspotClient.crm.contacts.basicApi.getPage(
            limit,
            undefined,
            ['firstname', 'lastname', 'email', 'company', 'phone', 'lifecyclestage', 'hs_lead_status', 'createdate', 'lastmodifieddate']
        )
        return response.results
    } catch (error) {
        console.error('Error fetching HubSpot contacts:', error)
        return []
    }
}

// Calculate lead score based on HubSpot data
export function calculateLeadScore(contact: {
    properties: Record<string, string | null>
}): number {
    let score = 50 // Base score

    const props = contact.properties

    // Lifecycle stage scoring
    const stage = props.lifecyclestage?.toLowerCase()
    if (stage === 'opportunity') score += 30
    else if (stage === 'marketingqualifiedlead') score += 20
    else if (stage === 'salesqualifiedlead') score += 25
    else if (stage === 'subscriber') score += 5
    else if (stage === 'lead') score += 10

    // Lead status scoring
    const status = props.hs_lead_status?.toLowerCase()
    if (status === 'new') score += 10
    else if (status === 'open') score += 15
    else if (status === 'in_progress') score += 20
    else if (status === 'attempted_to_contact') score += 5

    // Has company info
    if (props.company) score += 5

    // Has phone
    if (props.phone) score += 5

    return Math.min(100, Math.max(0, score))
}

// Get stage category
export function getStageFromScore(score: number): 'Hot' | 'Warm' | 'Cold' {
    if (score >= 80) return 'Hot'
    if (score >= 60) return 'Warm'
    return 'Cold'
}

// Transform HubSpot contact to Velodesk lead format
export function transformContact(contact: {
    id: string
    properties: Record<string, string | null>
}) {
    const score = calculateLeadScore(contact)
    const name = [contact.properties.firstname, contact.properties.lastname]
        .filter(Boolean)
        .join(' ') || contact.properties.email || 'Unknown'

    return {
        id: contact.id,
        name: contact.properties.company || name,
        email: contact.properties.email || '',
        score,
        stage: getStageFromScore(score),
        lastActivity: getRelativeTime(contact.properties.lastmodifieddate),
        source: 'HubSpot',
        company: contact.properties.company || '',
        phone: contact.properties.phone || '',
        lifecycleStage: contact.properties.lifecyclestage || '',
    }
}

// Helper: relative time
function getRelativeTime(dateStr: string | null): string {
    if (!dateStr) return 'Unknown'

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours === 0) return 'Just now'
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    }
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`
}
