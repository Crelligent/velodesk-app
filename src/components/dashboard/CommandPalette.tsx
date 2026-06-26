'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Command, Users, BarChart2, FolderOpen, Zap, ArrowRight, CornerDownLeft } from 'lucide-react'

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((prev) => !prev)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        const handleCustomEvent = () => setIsOpen(true)

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('open-command-palette', handleCustomEvent)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('open-command-palette', handleCustomEvent)
        }
    }, [])

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // slight delay to ensure render
            setTimeout(() => inputRef.current?.focus(), 10)
        } else {
            setQuery('') // Reset query when closed
        }
    }, [isOpen])

    if (!isOpen) return null

    const mockResults = [
        {
            group: 'Suggested Actions',
            items: [
                { icon: Zap, label: 'Analyze recent Stripe MRR drop', type: 'AI Action' },
                { icon: Users, label: 'View Enterprise Churn Cohort', type: 'Navigate' },
                { icon: BarChart2, label: 'Go to PMF Analytics', type: 'Navigate' },
            ]
        },
        {
            group: 'Customer Search',
            items: [
                { icon: Search, label: 'Acme Corp', type: 'Customer' },
                { icon: Search, label: 'Globex Inc', type: 'Customer' },
            ]
        },
        {
            group: 'Recent Data Rooms',
            items: [
                { icon: FolderOpen, label: 'Q3 Board Report Data', type: 'Room' },
                { icon: FolderOpen, label: 'Series B Diligence', type: 'Room' },
            ]
        }
    ]

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-[600px] bg-[#141518] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200">
                
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-white/40 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search or type a command..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-white/30"
                    />
                    <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono tracking-widest uppercase">
                        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">ESC</span> to close
                    </div>
                </div>

                {/* Results List */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {mockResults.map((group, groupIdx) => (
                        <div key={groupIdx} className="mb-4 last:mb-0">
                            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30 font-medium font-mono">
                                {group.group}
                            </div>
                            <div className="space-y-0.5">
                                {group.items.map((item, itemIdx) => {
                                    const Icon = item.icon
                                    return (
                                        <div 
                                            key={itemIdx}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer group/item transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/50 group-hover/item:text-white/90 group-hover/item:bg-white/10 transition-colors">
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[13px] text-white/80 group-hover/item:text-white">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-white/40">{item.type}</span>
                                                <CornerDownLeft className="w-3 h-3 text-white/40" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
