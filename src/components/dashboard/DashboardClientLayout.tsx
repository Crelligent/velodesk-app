'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    LogOut,
    ChevronDown,
    Activity,
    PlaySquare,
    SlidersHorizontal,
    FolderOpen,
    FileText,
    Plug,
    Search,
    TrendingUp,
    Network,
    UserCheck,
} from 'lucide-react'

import AIAgentWindow from './AIAgentWindow'
import CommandPalette from './CommandPalette'
import InvestorModeOverlay from './InvestorModeOverlay'

// `sample: true` pages still show illustrative figures, not the user's own data.
// Only the shared demo accounts see them; real accounts get a clean workspace.
type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; color: string; sample?: boolean }
const navSections: { title: string; items: NavItem[] }[] = [
    {
        title: 'The Score',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', color: 'text-blue-400' },
            { href: '/dashboard/pulse', icon: Activity, label: 'The Pulse', color: 'text-[#FF6B35]', sample: true },
        ]
    },
    {
        title: 'The Math',
        items: [
            { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-400', sample: true },
            { href: '/dashboard/cohort-dvr', icon: PlaySquare, label: 'Cohort DVR', color: 'text-pink-400', sample: true },
            { href: '/dashboard/simulator', icon: SlidersHorizontal, label: 'Simulator', color: 'text-amber-400', sample: true },
        ]
    },
    {
        title: 'The Proof',
        items: [
            { href: '/dashboard/benchmarks', icon: TrendingUp, label: 'Cohort Benchmarks', color: 'text-teal-400', sample: true },
            { href: '/dashboard/data-room', icon: FolderOpen, label: 'Live Data Room', color: 'text-emerald-400', sample: true },
            { href: '/dashboard/investors', icon: UserCheck, label: 'Investor Access', color: 'text-emerald-400' },
            { href: '/dashboard/pmf-report', icon: FileText, label: 'PMF Report', color: 'text-cyan-400', sample: true },
            { href: '/dashboard/investor-api', icon: Network, label: 'Investor API Sync', color: 'text-indigo-400', sample: true },
        ]
    },
    {
        title: 'Workspace',
        items: [
            { href: '/dashboard/integrations', icon: Plug, label: 'Integrations', color: 'text-slate-400' },
            { href: '/dashboard/settings', icon: Settings, label: 'Settings', color: 'text-slate-400' },
        ]
    },
]

// Pages that should NOT show the sidebar
const fullWidthPages = ['/dashboard/integrations']

interface DashboardClientLayoutProps {
    children: React.ReactNode
    user: {
        email: string
        name: string
        avatarUrl?: string
        planLabel: string
        isDemo: boolean
    }
}

export default function DashboardClientLayout({ children, user }: DashboardClientLayoutProps) {
    const pathname = usePathname()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [isInvestorModeOpen, setIsInvestorModeOpen] = useState(false)

    const showSidebar = !fullWidthPages.includes(pathname)
    const sections = navSections
        .map((section) => ({ ...section, items: section.items.filter((item) => user.isDemo || !item.sample) }))
        .filter((section) => section.items.length > 0)
    const paletteItems = sections.flatMap((section) => section.items.map(({ href, label }) => ({ href, label })))
    const initials = (user.name || user.email).split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'V'

    return (
        <div data-clarity-mask="True" className="min-h-screen bg-[#04060D] text-white flex flex-col">
            {/* Top Header Bar */}
            <header className="h-16 bg-[#04060D] border-b border-white/5 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
                
                {/* Left: Custom Client Header Brand */}
                <div className="flex items-center gap-1.5 w-[240px]">
                    <img 
                        src="/velodesk (2).png" 
                        alt="VeloDesk Logo" 
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-outfit font-light tracking-widest text-sm text-white">VELODESK</span>
                </div>

                {/* Center & Right Actions - Only visible on main dashboard */}
                {pathname === '/dashboard' && (
                    <>
                        {/* Center: Global Search Trigger */}
                        <div className="flex-1 flex items-center justify-center hidden md:flex">
                            <button 
                                onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
                                className="flex items-center justify-between w-full max-w-md px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-md transition-colors text-white/40 group"
                            >
                                <div className="flex items-center gap-2">
                                    <Search className="w-3.5 h-3.5" />
                                    <span className="text-[13px] font-light">Search or type a command...</span>
                                </div>
                                <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-white/10 px-1 rounded">⌘</span>
                                    <span className="bg-white/10 px-1 rounded">K</span>
                                </div>
                            </button>
                        </div>

                        {/* Right Actions & Profile */}
                        <div className="flex items-center justify-end gap-4 flex-shrink-0">
                            {user.isDemo && (
                                <button
                                    onClick={() => setIsInvestorModeOpen(true)}
                                    className="px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-medium hover:bg-[#22c55e]/20 transition rounded whitespace-nowrap flex items-center gap-2"
                                >
                                    <PlaySquare size={14} /> Fundraising Deck
                                </button>
                            )}
                            {user.isDemo && <Link
                                href="/dashboard/pmf-report"
                                className="px-4 py-2 bg-[#7B61FF] text-white text-xs font-medium hover:bg-[#8A73FF] transition rounded whitespace-nowrap"
                            >
                                Export Report
                            </Link>}

                        </div>
                    </>
                )}
            </header>

            <div className="flex pt-16">
                {/* Sidebar - Conditionally shown */}
                {showSidebar && (
                    <aside className="w-[260px] bg-[#04060D] border-r border-white/5 fixed top-16 left-0 bottom-0 flex flex-col z-40">
                        {/* Navigation */}
                        <nav className="px-6 py-6 space-y-8 flex-1 overflow-y-auto">
                            {sections.map((section) => (
                                <div key={section.title}>
                                    <div className="px-4 mb-4 text-xs uppercase tracking-[0.25em] text-[#404040] font-medium">
                                        {section.title}
                                    </div>
                                    <ul className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const IconComponent = item.icon
                                            const isActive = pathname === item.href
                                            return (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        className={`flex items-center gap-3 px-4 py-2 text-[0.8rem] tracking-wide font-light group transition rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${isActive
                                                            ? 'text-white bg-white/5'
                                                            : 'text-[#606060] hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`w-4 h-4 stroke-[1.5] transition ${item.color} ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        {/* Profile Section at Bottom */}
                        <div className="p-4 border-t border-white/5 relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition"
                            >
                                <div className="flex items-center gap-3">
                                    {user.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- remote avatar from the auth provider
                                        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                                    ) : (
                                        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/80">{initials}</span>
                                    )}
                                    <div className="flex min-w-0 flex-col items-start">
                                        <span className="max-w-[150px] truncate text-sm font-medium text-white/90">{user.name}</span>
                                        <span className="text-[10px] text-white/50">{user.planLabel}</span>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/40 transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute left-4 bottom-full mb-2 w-56 bg-[#141518] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <div className="text-sm font-medium text-white/90 truncate">{user.email}</div>
                                            <div className="text-xs text-white/50">{user.planLabel}</div>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="w-4 h-4 stroke-[1.5]" />
                                                Workspace Settings
                                            </Link>
                                            <form action="/auth/signout" method="post">
                                                <button
                                                    type="submit"
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition"
                                                >
                                                    <LogOut className="w-4 h-4 stroke-[1.5]" />
                                                    Sign out
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className={`flex-1 px-4 md:px-8 lg:px-12 py-8 ${showSidebar ? 'ml-[260px]' : ''}`}>
                    {children}
                </main>

                {showSidebar && (
                    <AIAgentWindow />
                )}
                
                {/* Global Command Palette */}
                <CommandPalette items={paletteItems} />

                {/* Investor Mode Overlay */}
                <InvestorModeOverlay 
                    isOpen={isInvestorModeOpen} 
                    onClose={() => setIsInvestorModeOpen(false)} 
                    companyName="Your company" 
                />
            </div>
        </div>
    )
}
