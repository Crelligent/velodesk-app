'use client'

import { useScrollReveal } from '@/hooks/useScrollAnimations'

export default function AcceleratorPartners() {
    const { ref, isVisible } = useScrollReveal(0.1)

    const partners = ['Y Combinator', 'Microtraction', 'Techstars', '500 Startups', 'Sequoia']

    return (
        <section ref={ref} className={`py-16 bg-[#04060D] border-t border-white/5 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-8">Standardizing PMF reporting for the world's top accelerators</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {partners.map((partner) => (
                        <div key={partner} className="text-white/20 font-orbitron font-bold text-xl md:text-2xl hover:text-white/40 transition-colors cursor-default">
                            {partner}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
