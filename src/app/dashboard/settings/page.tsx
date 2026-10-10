'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
    const [user, setUser] = useState<{ email?: string } | null>(null)
    const [profile, setProfile] = useState({
        full_name: '',
        company_name: '',
        billing_address: '',
        tax_id: '',
    })
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        company_name: data.company_name || '',
                        billing_address: data.billing_address || '',
                        tax_id: data.tax_id || '',
                    })
                }
            }
        }

        fetchData()
    }, [supabase])

    const handleSave = async () => {
        if (!user) return

        setLoading(true)
        setSaved(false)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.full_name,
                company_name: profile.company_name,
                billing_address: profile.billing_address.trim() || null,
                tax_id: profile.tax_id.trim() || null,
            })
            .eq('id', (user as { id: string }).id)

        setLoading(false)

        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-light mb-1">Settings</h1>
                <p className="text-gray-500">Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <div className="max-w-2xl">
                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg mb-6">
                    <h2 className="text-lg font-medium mb-6">Profile</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Company</label>
                            <input
                                type="text"
                                value={profile.company_name}
                                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                            />
                        </div>

                        <div id="billing" className="pt-2">
                            <p className="text-sm font-medium mb-1">Billing details</p>
                            <p className="text-xs text-gray-500 mb-4">Shown on your invoices and receipts. Company above is used as the &quot;Billed to&quot; name.</p>
                            <label htmlFor="billing_address" className="block text-sm text-gray-400 mb-2">Billing address</label>
                            <textarea
                                id="billing_address"
                                rows={3}
                                value={profile.billing_address}
                                onChange={(e) => setProfile({ ...profile, billing_address: e.target.value })}
                                placeholder={'14 Admiralty Way\nLekki Phase 1, Lagos'}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="tax_id" className="block text-sm text-gray-400 mb-2">Tax ID (TIN / VAT number, optional)</label>
                            <input
                                id="tax_id"
                                type="text"
                                value={profile.tax_id}
                                onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded focus:outline-none focus:border-[#22c55e] transition"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            {saved && (
                                <span className="text-sm text-[#22c55e]">✓ Saved successfully</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Billing */}
                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-lg mb-6">
                    <h2 className="text-lg font-medium mb-2">Plan &amp; billing</h2>
                    <p className="text-sm text-gray-500 mb-5">Your plan, payment card, invoices and receipts.</p>
                    <a
                        href="/billing"
                        className="inline-block px-4 py-2 bg-[#22c55e] text-black font-medium rounded hover:bg-[#16a34a] transition"
                    >
                        Manage billing
                    </a>
                </div>

                {/* Danger Zone */}
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <h2 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Once you delete your account, there is no going back.
                    </p>
                    <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}
