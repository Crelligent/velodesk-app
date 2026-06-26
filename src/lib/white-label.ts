// White-Label Configuration Library
// Handles enterprise branding and customization

import { createClient } from '@/lib/supabase/server'

// Types
export interface EnterpriseSettings {
    id: string
    organization_id: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    font_family: string
    custom_domain: string | null
    remove_branding: boolean
    custom_footer_text: string | null
    email_from_name: string | null
    email_from_address: string | null
    created_at: string
    updated_at: string
}

export interface BrandingConfig {
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    removeBranding: boolean
    customFooter: string | null
}

// Default branding for non-enterprise users
export const defaultBranding: BrandingConfig = {
    logoUrl: null,
    primaryColor: '#22c55e',
    secondaryColor: '#1a1a1a',
    fontFamily: 'Outfit',
    removeBranding: false,
    customFooter: null,
}

// Get enterprise settings for an organization
export async function getEnterpriseSettings(organizationId: string): Promise<EnterpriseSettings | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('enterprise_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single()

    if (error) {
        return null
    }

    return data
}

// Create or update enterprise settings
export async function upsertEnterpriseSettings(
    organizationId: string,
    settings: Partial<EnterpriseSettings>
): Promise<{ success: boolean; settings?: EnterpriseSettings; error?: string }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('enterprise_settings')
        .upsert(
            {
                organization_id: organizationId,
                ...settings,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'organization_id' }
        )
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, settings: data }
}

// Get branding for a report
export async function getReportBranding(
    organizationId?: string | null,
    customBranding?: Partial<BrandingConfig> | null
): Promise<BrandingConfig> {
    // If custom branding is provided, merge with defaults
    if (customBranding) {
        return { ...defaultBranding, ...customBranding }
    }

    // If organization ID, fetch enterprise settings
    if (organizationId) {
        const settings = await getEnterpriseSettings(organizationId)
        if (settings) {
            return {
                logoUrl: settings.logo_url,
                primaryColor: settings.primary_color,
                secondaryColor: settings.secondary_color,
                fontFamily: settings.font_family,
                removeBranding: settings.remove_branding,
                customFooter: settings.custom_footer_text,
            }
        }
    }

    return defaultBranding
}

// Generate CSS variables for branding
export function generateBrandingCSS(branding: BrandingConfig): string {
    return `
    :root {
      --brand-primary: ${branding.primaryColor};
      --brand-secondary: ${branding.secondaryColor};
      --brand-font: ${branding.fontFamily}, sans-serif;
    }
  `
}

// Validate custom domain format
export function isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i
    return domainRegex.test(domain)
}

// Upload logo (returns public URL)
export async function uploadLogo(
    organizationId: string,
    file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${organizationId}/logo.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true })

    if (uploadError) {
        return { success: false, error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
}

// Get email settings for white-label emails
export async function getEmailSettings(organizationId: string): Promise<{
    fromName: string
    fromEmail: string
}> {
    const settings = await getEnterpriseSettings(organizationId)

    if (settings?.email_from_name && settings?.email_from_address) {
        return {
            fromName: settings.email_from_name,
            fromEmail: settings.email_from_address,
        }
    }

    // Default
    return {
        fromName: 'Velodesk',
        fromEmail: 'no-reply@velodesk.io',
    }
}
