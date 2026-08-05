import { Building2, Plus } from 'lucide-react'

export default function StartupsPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
                <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-outfit font-light mb-4">All Startups</h1>
            <p className="text-[#606060] mb-8">
                The complete directory of your portfolio companies. Invite founders to connect their data sources to unlock real-time PMF tracking.
            </p>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Invite Founder
            </button>
        </div>
    )
}
