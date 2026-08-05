import { TrendingUp, Plus } from 'lucide-react'

export default function DealflowPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#7B61FF]/10 rounded-2xl flex items-center justify-center border border-[#7B61FF]/20 mb-6">
                <TrendingUp className="w-8 h-8 text-[#7B61FF]" />
            </div>
            <h1 className="text-3xl font-outfit font-light mb-4">Dealflow Pipeline</h1>
            <p className="text-[#606060] mb-8">
                Your pipeline for evaluating and tracking potential startup investments. Connect your CRM or add deals manually to begin tracking early PMF signals before you invest.
            </p>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Deal
            </button>
        </div>
    )
}
