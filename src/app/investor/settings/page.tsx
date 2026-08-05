import { Settings } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center border border-slate-500/20 mb-6">
                <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-3xl font-outfit font-light mb-4">Fund Settings</h1>
            <p className="text-[#606060] mb-8">
                Configure your fund's benchmark requirements, dealflow criteria, and custom branding for founder-facing interfaces.
            </p>
            <button className="px-6 py-3 bg-[#7B61FF] hover:bg-[#8A73FF] text-white rounded-lg text-sm transition-colors">
                Configure Workspace
            </button>
        </div>
    )
}
