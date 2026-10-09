'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Command, Users, BarChart2, FolderOpen, Zap, ArrowRight, CornerDownLeft } from 'lucide-react'

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((prev) => !prev)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
                setActiveIndex(-1)
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

    // Focus input when modal opens; trap focus inside dialog
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 10)
        } else {
            setQuery('')
            setActiveIndex(-1)
        }
    }, [isOpen])

    // Focus trap: keep Tab inside the dialog
    const handleDialogKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!dialogRef.current) return
        if (e.key !== 'Tab') return
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
    }, [])

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

    const allItems = mockResults.flatMap(g => g.items)

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            role="presentation"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                onKeyDown={handleDialogKeyDown}
                className="relative w-full max-w-[600px] bg-[#141518] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-white/5">
                    <Search className="w-5 h-5 text-white/40 mr-3" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded={true}
                        aria-controls="command-palette-listbox"
                        aria-autocomplete="list"
                        aria-activedescendant={activeIndex >= 0 ? `cmd-item-${activeIndex}` : undefined}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search or type a command..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder-white/30"
                    />
                    <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono tracking-widest uppercase" aria-hidden="true">
                        <span className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">ESC</span> to close
                    </div>
                </div>

                {/* Results List */}
                <div
                    id="command-palette-listbox"
                    role="listbox"
                    aria-label="Search results"
                    className="max-h-[400px] overflow-y-auto p-2"
                >
                    {mockResults.map((group, groupIdx) => {
                        const groupStartIdx = mockResults
                            .slice(0, groupIdx)
                            .reduce((acc, g) => acc + g.items.length, 0)
                        return (
                            <div key={groupIdx} className="mb-4 last:mb-0">
                                <div
                                    id={`cmd-group-${groupIdx}`}
                                    className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/30 font-medium font-mono"
                                    aria-hidden="true"
                                >
                                    {group.group}
                                </div>
                                <div className="space-y-0.5">
                                    {group.items.map((item, itemIdx) => {
                                        const Icon = item.icon
                                        const flatIdx = groupStartIdx + itemIdx
                                        const isActive = activeIndex === flatIdx
                                        return (
                                            <div
                                                key={itemIdx}
                                                id={`cmd-item-${flatIdx}`}
                                                role="option"
                                                aria-selected={isActive}
                                                tabIndex={0}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group/item transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30`}
                                                onClick={() => setIsOpen(false)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(false) }}
                                                onMouseEnter={() => setActiveIndex(flatIdx)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 flex items-center justify-center rounded bg-white/5 text-white/50 group-hover/item:text-white/90 group-hover/item:bg-white/10 transition-colors" aria-hidden="true">
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[13px] text-white/80 group-hover/item:text-white">{item.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity" aria-hidden="true">
                                                    <span className="text-[10px] text-white/40">{item.type}</span>
                                                    <CornerDownLeft className="w-3 h-3 text-white/40" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
