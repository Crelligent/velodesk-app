import { Users, UserPlus } from 'lucide-react'

export default function TeamPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center border border-slate-500/20 mb-6">
                <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-3xl font-outfit font-light mb-4">Partners & Analysts</h1>
            <p className="text-[#606060] mb-8">
                Manage access for your investment committee, partners, and analysts. Assign team members to monitor specific portfolio companies.
            </p>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Team Member
            </button>
        </div>
    )
}
