// Team Management Library
// Handles team invites, members, and permissions

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Types
export interface TeamMember {
    id: string
    user_id: string
    organization_id: string
    role: 'owner' | 'admin' | 'member' | 'viewer'
    invited_at: string
    accepted_at: string | null
    user?: {
        email: string
        full_name: string
        avatar_url: string
    }
}

export interface TeamInvite {
    id: string
    organization_id: string
    email: string
    role: 'admin' | 'member' | 'viewer'
    token: string
    invited_by: string
    expires_at: string
    accepted_at: string | null
    created_at: string
}

export interface Organization {
    id: string
    name: string
    industry: string
    size: string
    website: string
    owner_id: string
}

// Generate a secure invite token
export function generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex')
}

// Get organization members
export async function getOrganizationMembers(organizationId: string): Promise<TeamMember[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('organization_members')
        .select(`
      *,
      user:profiles (email, full_name, avatar_url)
    `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching members:', error)
        return []
    }

    return data || []
}

// Invite a new team member
export async function inviteTeamMember(
    organizationId: string,
    email: string,
    role: 'admin' | 'member' | 'viewer',
    invitedBy: string
): Promise<{ success: boolean; invite?: TeamInvite; error?: string }> {
    const supabase = await createClient()

    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const { data, error } = await supabase
        .from('team_invites')
        .insert({
            organization_id: organizationId,
            email: email.toLowerCase(),
            role,
            token,
            invited_by: invitedBy,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'This email has already been invited.' }
        }
        return { success: false, error: error.message }
    }

    return { success: true, invite: data }
}

// Accept a team invite
export async function acceptTeamInvite(
    token: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Find the invite
    const { data: invite, error: findError } = await supabase
        .from('team_invites')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

    if (findError || !invite) {
        return { success: false, error: 'Invalid or expired invite.' }
    }

    // Check if user email matches invite email
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

    if (profile?.email?.toLowerCase() !== invite.email.toLowerCase()) {
        return { success: false, error: 'This invite is for a different email address.' }
    }

    // Add member to organization
    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: invite.organization_id,
            user_id: userId,
            role: invite.role,
            invited_by: invite.invited_by,
            invited_at: invite.created_at,
            accepted_at: new Date().toISOString(),
        })

    if (memberError) {
        if (memberError.code === '23505') {
            return { success: false, error: 'You are already a member of this organization.' }
        }
        return { success: false, error: memberError.message }
    }

    // Mark invite as accepted
    await supabase
        .from('team_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id)

    return { success: true }
}

// Update member role
export async function updateMemberRole(
    membershipId: string,
    newRole: 'admin' | 'member' | 'viewer'
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', membershipId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Remove a team member
export async function removeMember(membershipId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', membershipId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Get pending invites
export async function getPendingInvites(organizationId: string): Promise<TeamInvite[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('organization_id', organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching invites:', error)
        return []
    }

    return data || []
}

// Cancel an invite
export async function cancelInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Check if user has permission
export async function checkPermission(
    userId: string,
    organizationId: string,
    requiredRole: 'owner' | 'admin' | 'member' | 'viewer'
): Promise<boolean> {
    const supabase = await createClient()

    const roleHierarchy = {
        owner: 4,
        admin: 3,
        member: 2,
        viewer: 1,
    }

    const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single()

    if (!member) return false

    return roleHierarchy[member.role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole]
}

// Create an organization and add owner
export async function createOrganization(
    ownerId: string,
    name: string,
    details?: { industry?: string; size?: string; website?: string }
): Promise<{ success: boolean; organization?: Organization; error?: string }> {
    const supabase = await createClient()

    // Create organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name,
            owner_id: ownerId,
            ...details,
        })
        .select()
        .single()

    if (orgError) {
        return { success: false, error: orgError.message }
    }

    // Add owner as member
    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: ownerId,
            role: 'owner',
            accepted_at: new Date().toISOString(),
        })

    if (memberError) {
        // Rollback org creation
        await supabase.from('organizations').delete().eq('id', org.id)
        return { success: false, error: memberError.message }
    }

    return { success: true, organization: org }
}
