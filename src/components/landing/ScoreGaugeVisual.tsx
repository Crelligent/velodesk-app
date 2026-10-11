import { BANDS, bandFor } from './pmfModel'

const CX = 120
const CY = 118
const R = 96

function point(score: number, r = R) {
  const a = Math.PI * (1 - score / 100)
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)] as const
}

function arc(from: number, to: number) {
  const [x1, y1] = point(from)
  const [x2, y2] = point(to)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/** Step 3 visual: a sample PMF Score on a 0–100 gauge with the four bands. */
export default function ScoreGaugeVisual({ score = 68, compact = false }: { score?: number; compact?: boolean }) {
  const band = bandFor(score)
  const [nx, ny] = point(score, R - 22)

  return (
    <figure className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <figcaption className="mb-2 flex items-center justify-between gap-3">
        <span className="font-dm-mono text-[11px] uppercase tracking-widest text-white/60">PMF Score</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-dm-mono text-[10px] uppercase tracking-wider text-white/70">
          Sample
        </span>
      </figcaption>

      <div className={`grid items-center gap-5 ${compact ? '' : 'sm:grid-cols-[minmax(0,1fr)_auto]'}`}>
        <svg viewBox="0 0 240 140" role="img" aria-label={`Sample PMF Score ${score} out of 100: ${band.label}`} className="mx-auto w-full max-w-[280px]">
          {BANDS.map((b, i) => (
            <path
              key={b.label}
              d={arc(b.min + (i === 0 ? 0 : 0.8), Math.min(100, b.max + 1) - (i === BANDS.length - 1 ? 0 : 0.8))}
              fill="none"
              stroke={b.color}
              strokeOpacity={b.label === band.label ? 1 : 0.35}
              strokeWidth={14}
            />
          ))}
          {[0, 40, 60, 80, 100].map((t) => {
            const [tx, ty] = point(t, R + 16)
            return (
              <text key={t} x={tx} y={ty + 3} textAnchor="middle" className="fill-white/60 font-dm-mono" fontSize="9">
                {t}
              </text>
            )
          })}
          <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={5} fill="white" />
          <text x={CX} y={CY - 30} textAnchor="middle" fill="white" fontSize="40" fontWeight="300" className="font-outfit tabular-nums">
            {score}
          </text>
        </svg>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-1">
          {[...BANDS].reverse().map((b) => (
            <li key={b.label} className={`flex items-center gap-2 ${b.label === band.label ? 'text-white' : 'text-white/60'}`}>
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: b.color }} />
              <span className="font-dm-mono tabular-nums">{b.min === 80 ? '80+' : b.min === 0 ? '<40' : `${b.min}–${b.max}`}</span>
              <span>{b.label}</span>
              {b.label === band.label ? <span className="sr-only">(this sample)</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
