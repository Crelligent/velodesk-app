import { LIVE_COUNT, LIVE_INTEGRATIONS } from './liveIntegrations'

/**
 * Step 1 visual: one live tool per data type, each wired into Velodesk.
 * Every tool shown here really connects today (pulled from LIVE_INTEGRATIONS).
 */
const PICKS = [
  { id: 'paystack', kind: 'Payments' },
  { id: 'mixpanel', kind: 'Analytics' },
  { id: 'hubspot', kind: 'CRM' },
  { id: 'intercom', kind: 'Support' },
] as const

const TOOLS = PICKS.flatMap((p) => {
  const tool = LIVE_INTEGRATIONS.find((i) => i.id === p.id)
  return tool ? [{ ...p, name: tool.name, logo: tool.logo ?? null, auth: tool.authType === 'oauth' ? 'OAuth' : 'API key' }] : []
})

const W = 320
const ROW = 50
const TOP = 10
const CHIP_W = 150
const CHIP_H = 38
const HUB_X = 268
const H = TOP * 2 + ROW * (TOOLS.length - 1) + CHIP_H
const HUB_Y = H / 2

function wire(y: number) {
  const x1 = CHIP_W + 2
  const x2 = HUB_X - 30
  return `M ${x1} ${y} C ${x1 + 48} ${y}, ${x2 - 48} ${HUB_Y}, ${x2} ${HUB_Y}`
}

export default function ConnectToolsVisual() {
  return (
    <figure className="flex h-full w-full flex-col justify-between gap-3 p-4">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${TOOLS.map((t) => t.name).join(', ')} connected to Velodesk`} className="w-full">
        <defs>
          <linearGradient id="ctv-wire" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="ctv-hub" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7B61FF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <clipPath id="ctv-logo">
            <rect width="22" height="22" rx="3" />
          </clipPath>
        </defs>

        {/* Wires */}
        {TOOLS.map((t, i) => (
          <path key={`w-${t.id}`} d={wire(TOP + i * ROW + CHIP_H / 2)} fill="none" stroke="url(#ctv-wire)" strokeWidth="1.5" />
        ))}

        {/* Data moving along the wires (hidden when the visitor prefers reduced motion) */}
        <g className="motion-reduce:hidden">
          {TOOLS.map((t, i) => (
            <circle key={`d-${t.id}`} r="2.6" fill="#A5B4FC">
              <animateMotion dur="2.6s" begin={`${i * 0.55}s`} repeatCount="indefinite" path={wire(TOP + i * ROW + CHIP_H / 2)} />
              <animate attributeName="opacity" values="0;1;1;0" dur="2.6s" begin={`${i * 0.55}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>

        {/* Tool chips */}
        {TOOLS.map((t, i) => {
          const y = TOP + i * ROW
          return (
            <g key={t.id} transform={`translate(0 ${y})`}>
              <rect width={CHIP_W} height={CHIP_H} rx="10" fill="#11131F" stroke="rgba(255,255,255,0.10)" />
              <rect x="5" y="5" width="28" height="28" rx="7" fill="#fff" />
              {t.logo ? (
                <g transform="translate(8 8)" clipPath="url(#ctv-logo)">
                  <image href={t.logo} width="22" height="22" preserveAspectRatio="xMidYMid meet" />
                </g>
              ) : null}
              <text x="41" y="17" fill="#fff" fontSize="11" fontWeight="500" className="font-outfit">{t.name}</text>
              <text x="41" y="29" fill="rgba(255,255,255,0.5)" fontSize="8" className="font-dm-mono" letterSpacing="0.4">
                {t.kind.toUpperCase()}
              </text>
              <circle cx={CHIP_W - 12} cy={CHIP_H / 2} r="3.2" fill="#34D399" />
              <circle cx={CHIP_W - 12} cy={CHIP_H / 2} r="3.2" fill="none" stroke="#34D399" strokeOpacity="0.5" className="motion-reduce:hidden">
                <animate attributeName="r" values="3.2;7;3.2" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.4s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
              </circle>
            </g>
          )
        })}

        {/* Velodesk hub */}
        <circle cx={HUB_X} cy={HUB_Y} r="40" fill="#7B61FF" opacity="0.10" />
        <circle cx={HUB_X} cy={HUB_Y} r="30" fill="url(#ctv-hub)" />
        <image href="/icon.png" x={HUB_X - 22} y={HUB_Y - 22} width="44" height="44" />
        <text x={HUB_X} y={HUB_Y + 46} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" className="font-dm-mono" letterSpacing="0.6">
          VELODESK
        </text>
      </svg>

      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 font-dm-mono text-[10px] uppercase tracking-wider text-white/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" aria-hidden="true" />
          Connected with an API key or OAuth
        </span>
        <span>+{Math.max(0, LIVE_COUNT - TOOLS.length)} more tools</span>
      </figcaption>
    </figure>
  )
}
