'use client'

/* eslint-disable @next/next/no-img-element */
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, CheckCircle2, CircleAlert, Minus, RotateCcw, Sparkles, X } from 'lucide-react'

type Step = { tool: string; label: string; ok: boolean }
type Msg =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; steps?: Step[]; sources?: string[] }
  | { role: 'error'; content: string; retry?: boolean }

const STORAGE_KEY = 'velodesk-ai-chat'
const SUGGESTIONS = [
  'How is my PMF Score calculated?',
  'Which signal should I fix first?',
  'How has my score changed recently?',
  'Which tools should I connect next?',
]

function loadSaved(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(-30) : []
  } catch {
    return []
  }
}

/** Renders **bold**, bullet lines and paragraphs. Plain React text only, never HTML. */
function RichText({ text }: { text: string }) {
  const inline = (line: string): ReactNode[] =>
    line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-medium text-white">{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
  const blocks: ReactNode[] = []
  let bullets: string[] = []
  const flush = () => {
    if (!bullets.length) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-1 marker:text-white/30">
        {bullets.map((b, i) => <li key={i}>{inline(b)}</li>)}
      </ul>,
    )
    bullets = []
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (bullet) { bullets.push(bullet[1]); continue }
    flush()
    if (!line) continue
    const heading = line.match(/^#{1,4}\s+(.*)$/)
    blocks.push(
      <p key={`p-${blocks.length}`} className={heading ? 'font-medium text-white' : ''}>
        {inline(heading ? heading[1] : line)}
      </p>,
    )
  }
  flush()
  return <div className="space-y-2">{blocks}</div>
}

export default function AIAgentWindow() {
  const [open, setOpen] = useState(false)
  // Saved chat only shows once the panel is opened, so server and first client render match
  const [messages, setMessages] = useState<Msg[]>(() => (typeof window === 'undefined' ? [] : loadSaved()))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))) } catch { /* storage unavailable */ }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    if (!open || configured !== null) return
    fetch('/api/ai/copilot')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setConfigured(d ? Boolean(d.configured) : null))
      .catch(() => setConfigured(null))
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, configured])

  const send = useCallback(async (text: string, history: Msg[]) => {
    const question = text.trim()
    if (!question || busy) return
    const next: Msg[] = [...history.filter((m) => m.role !== 'error'), { role: 'user', content: question }]
    setMessages(next)
    setInput('')
    setBusy(true)
    try {
      const payload = next
        .filter((m): m is Exclude<Msg, { role: 'error' }> => m.role !== 'error')
        .map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'not_configured') setConfigured(false)
        setMessages([...next, { role: 'error', content: data.error || 'Something went wrong. Please try again.', retry: res.status >= 500 && data.code !== 'not_configured' }])
      } else {
        setMessages([...next, { role: 'assistant', content: data.message, steps: data.steps, sources: data.sources }])
      }
    } catch {
      setMessages([...next, { role: 'error', content: "Couldn't reach Velodesk AI. Check your connection and try again.", retry: true }])
    } finally {
      setBusy(false)
    }
  }, [busy])

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    const idx = messages.lastIndexOf(lastUser)
    send(lastUser.content, messages.slice(0, idx))
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141518] py-2 pl-2 pr-4 text-sm font-medium text-white shadow-2xl transition hover:border-[#7B61FF]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7B61FF] to-[#38BDF8]">
          <img src="/icon.png" alt="" className="h-5 w-5" />
        </span>
        Ask Velodesk AI
      </button>
    )
  }

  return (
    <section
      aria-label="Velodesk AI"
      className="fixed bottom-4 right-4 z-50 flex h-[min(600px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141518] font-sans shadow-2xl"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 px-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7B61FF] to-[#38BDF8]">
            <img src="/icon.png" alt="" className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-white">Velodesk AI</span>
          <span className="rounded border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/50">Read-only</span>
        </div>
        <div className="flex items-center gap-1 text-white/50">
          {messages.length > 0 && (
            <button type="button" onClick={() => setMessages([])} disabled={busy} className="rounded p-1.5 transition hover:bg-white/5 hover:text-white disabled:opacity-40" aria-label="Start a new conversation" title="New conversation">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} className="rounded p-1.5 transition hover:bg-white/5 hover:text-white" aria-label="Minimise" title="Minimise">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => { setOpen(false); setMessages([]) }} className="rounded p-1.5 transition hover:bg-white/5 hover:text-white" aria-label="Close and clear" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed text-white/80" aria-live="polite">
        {configured === false && (
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-[12px] text-amber-100/90">
            Velodesk AI isn&apos;t switched on for this workspace yet. Please check back soon.
          </div>
        )}

        {messages.length === 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1.5 font-medium text-white">
              <Sparkles className="h-4 w-4 text-[#A5B4FC]" aria-hidden="true" /> Ask about your numbers
            </div>
            <p className="mb-4 text-white/60">
              I look up your PMF Score, signals, connected tools and experiments before I answer, and tell you where each number came from.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy || configured === false}
                  onClick={() => send(s, messages)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-[12px] text-white/80 transition hover:border-[#7B61FF]/40 hover:bg-white/[0.05] disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          if (m.role === 'user') {
            return (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#6A4FF0] px-3.5 py-2 text-white">
                {m.content}
              </div>
            )
          }
          if (m.role === 'error') {
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-[12px] text-red-100/90">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  {m.content}
                  {m.retry && (
                    <button type="button" onClick={retry} disabled={busy} className="ml-2 underline underline-offset-2 hover:text-white">Try again</button>
                  )}
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="space-y-2">
              {!!m.steps?.length && (
                <div className="space-y-1 font-dm-mono text-[11px] text-white/50">
                  {m.steps.map((s, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      {s.ok ? <CheckCircle2 className="h-3 w-3 text-[#34D399]" aria-hidden="true" /> : <CircleAlert className="h-3 w-3 text-amber-300" aria-hidden="true" />}
                      {s.ok ? s.label : `${s.label} (couldn't check)`}
                    </div>
                  ))}
                </div>
              )}
              <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <RichText text={m.content} />
                {!!m.sources?.length && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-dm-mono text-[10px] text-white/60">Source: {s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {busy && (
          <div className="flex items-center gap-2 text-[12px] text-white/50" role="status">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A5B4FC] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A5B4FC] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A5B4FC]" />
            </span>
            Looking at your data…
          </div>
        )}
      </div>

      <form
        className="shrink-0 border-t border-white/5 p-3"
        onSubmit={(e) => { e.preventDefault(); send(input, messages) }}
      >
        <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-[#1C1D21] p-2 focus-within:border-[#7B61FF]/50">
          <label htmlFor="velodesk-ai-input" className="sr-only">Ask Velodesk AI</label>
          <textarea
            id="velodesk-ai-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={4000}
            disabled={configured === false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input, messages) }
            }}
            placeholder="Ask about your score…"
            className="max-h-32 min-h-[24px] flex-1 resize-none border-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim() || configured === false}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#6A4FF0] to-[#3E6BD8] text-white transition disabled:opacity-30"
            aria-label="Send"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/40">Answers come from your Velodesk data. Check important numbers before you share them.</p>
      </form>
    </section>
  )
}
