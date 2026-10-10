'use client'

import { useScrollReveal } from '@/hooks/useScrollAnimations'

// Hidden until the owner confirms a formal partnership with each organisation below.
// Set to true only after confirming (and getting permission to use their names).
const SHOW_UNVERIFIED_CLAIMS = false

export default function AcceleratorPartners() {
    const { ref, isVisible } = useScrollReveal(0.1)

    // UNVERIFIED: implied partnerships with these accelerators / investors.
    const partners = ['Y Combinator', 'Microtraction', 'Techstars', '500 Startups', 'Sequoia']

    if (!SHOW_UNVERIFIED_CLAIMS) return null

    return (
        <section ref={ref} className={`py-16 bg-[#04060D] border-t border-white/5 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-xs font-mono tracking-widest uppercase text-[#8A8A8A] mb-8">Standardizing PMF reporting for the world's top accelerators</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {partners.map((partner) => (
                        <div key={partner} className="text-[#8A8A8A] font-orbitron font-bold text-xl md:text-2xl hover:text-white transition-colors cursor-default">
                            {partner}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
