import { FileText, Download } from 'lucide-react'

export default function ReportsPage() {
    return (
        <div className="animate-fade-in flex flex-col items-center justify-center h-[70vh] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 mb-6">
                <FileText className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-outfit font-light mb-4">Quarterly Reports</h1>
            <p className="text-[#606060] mb-8">
                AI-generated performance reports aggregating the Product-Market Fit velocity of your entire portfolio for LP updates.
            </p>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Generate Q2 2026 Report
            </button>
        </div>
    )
}
