import IntegrationLogo from './IntegrationLogo'
import { LIVE_INTEGRATIONS } from './liveIntegrations'

/**
 * The live integrations arranged in a ring, each wired into a central score node.
 * Pure SVG + CSS; scales cleanly at any width.
 */
export default function IntegrationsConstellation() {
  const n = LIVE_INTEGRATIONS.length
  const R = 41 // ring radius, % of the box
  const nodes = LIVE_INTEGRATIONS.map((integration, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    // Rounded so server and browser render identical numbers (avoids a hydration mismatch)
    const r2 = (v: number) => Math.round(v * 100) / 100
    return { integration, x: r2(50 + R * Math.cos(a)), y: r2(50 + R * Math.sin(a)) }
  })

  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[520px]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes constellationFlow { to { stroke-dashoffset: -12; } }
          .constellation-line { stroke-dasharray: 2 4; animation: constellationFlow 1.6s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .constellation-line { animation: none; } }
          `,
        }}
      />
      <div aria-hidden="true" className="absolute inset-[18%] rounded-full bg-[#7B61FF]/15 blur-3xl" />

      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="constellation-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.3" />
        <circle cx="50" cy="50" r={R - 14} fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="0.3" />
        {nodes.map(({ integration, x, y }) => (
          <line
            key={integration.id}
            x1={x}
            y1={y}
            x2="50"
            y2="50"
            stroke="url(#constellation-stroke)"
            strokeOpacity="0.55"
            strokeWidth="0.35"
            className="constellation-line"
          />
        ))}
      </svg>

      <ul className="absolute inset-0" aria-label="Tools that connect today">
        {nodes.map(({ integration, x, y }) => (
          <li
            key={integration.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <IntegrationLogo integration={integration} className="h-10 w-10 sm:h-14 sm:w-14" />
          </li>
        ))}
      </ul>

      <div className="absolute left-1/2 top-1/2 flex h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#7B61FF]/40 bg-[#0C0E1A] shadow-[0_0_60px_rgba(123,97,255,0.35)]">
        <span className="font-dm-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-white/70">PMF Score</span>
        <span className="font-outfit text-3xl sm:text-5xl font-light leading-none bg-gradient-to-r from-[#7B61FF] to-[#38BDF8] bg-clip-text text-transparent">
          68
        </span>
        <span className="mt-1 font-dm-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-white/60">Sample</span>
      </div>
      <figcaption className="sr-only">
        {LIVE_INTEGRATIONS.length} tools feeding one PMF Score: {LIVE_INTEGRATIONS.map((i) => i.name).join(', ')}.
      </figcaption>
    </figure>
  )
}
