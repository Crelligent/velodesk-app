import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvestorLayout from '@/components/investor/InvestorLayout'
import { needsPrivacyChoices } from '@/lib/privacy-server'

export default async function InvestorServerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    if (await needsPrivacyChoices(supabase, user)) redirect('/welcome/privacy?next=/investor/dashboard')

    // In a real app, you would also verify user.role === 'investor' here
    // and redirect them back to /dashboard if they are just a founder.

    return (
        <InvestorLayout
            user={{
                email: user.email || '',
                avatarUrl: user.user_metadata?.avatar_url
            }}
        >
            {children}
        </InvestorLayout>
    )
}
