import { SIGNALS } from './pmfModel'

/** Step 2 visual: the seven weighted signals, with one shown as not connected (excluded, not guessed). */
export default function SignalWeightsVisual({ missingKey = 'referral' }: { missingKey?: string }) {
  const max = Math.max(...SIGNALS.map((s) => s.weight))
  const connectedTotal = SIGNALS.filter((s) => s.key !== missingKey).reduce((a, s) => a + s.weight, 0)

  return (
    <figure className="rounded-xl border border-[#7B61FF]/20 bg-[#7B61FF]/[0.05] p-5">
      <figcaption className="mb-4 flex items-center justify-between gap-3">
        <span className="font-dm-mono text-[11px] uppercase tracking-widest text-white/60">Signal weights</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-dm-mono text-[10px] uppercase tracking-wider text-white/70">
          Sample
        </span>
      </figcaption>

      <ul className="space-y-2.5">
        {SIGNALS.map((s) => {
          const missing = s.key === missingKey
          return (
            // Phones: label + % on one line, bar full width below. sm+: label | bar | %
            <li key={s.key} className="grid grid-cols-[1fr_2.75rem] sm:grid-cols-[minmax(0,9.5rem)_1fr_2.75rem] items-center gap-x-3 gap-y-1.5 text-sm">
              <span className={missing ? 'text-white/60 line-through decoration-white/40' : 'text-white/85'}>{s.label}</span>
              <span className="relative order-last col-span-2 block h-2.5 rounded-full bg-white/[0.06] sm:order-none sm:col-span-1">
                {missing ? (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full border border-dashed border-white/30"
                    style={{ width: `${(s.weight / max) * 100}%` }}
                  />
                ) : (
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#7B61FF] to-[#38BDF8]"
                    style={{ width: `${(s.weight / max) * 100}%` }}
                  />
                )}
              </span>
              <span className={`text-right font-dm-mono tabular-nums ${missing ? 'text-white/60' : 'text-white'}`}>{s.weight}%</span>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/70">
        <span aria-hidden="true" className="mt-1 inline-block h-2 w-4 shrink-0 rounded-full border border-dashed border-white/40" />
        <span>
          Not connected? That signal is left out, not guessed. The score uses the other {connectedTotal}% and rescales it to 100.
        </span>
      </p>
    </figure>
  )
}
