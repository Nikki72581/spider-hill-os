'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type InboxItem = {
  id: string
  raw: string
  aiTitle?: string | null
  aiCategory?: string | null
  aiBucket?: string | null
  aiEnergy?: number | null
  aiMinutes?: number | null
  aiReason?: string | null
  createdAt: string
}

export default function CapturePage() {
  const [tab, setTab] = useState<'dump' | 'triage'>('dump')
  const [items, setItems] = useState<InboxItem[]>([])
  const [, start] = useTransition()
  const router = useRouter()

  const refresh = async () => {
    const r = await fetch('/api/inbox', { cache: 'no-store' })
    if (r.ok) setItems(await r.json())
  }
  useEffect(() => { refresh() }, [])

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderBottom: '1px solid var(--border-subtle)' }}>
        {(['dump', 'triage'] as const).map(t => {
          const active = tab === t
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', background: 'transparent', border: 0,
              borderBottom: active ? '2px solid var(--pip-green, #0CFF70)' : '2px solid transparent',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
              color: active ? 'var(--pip-bright, #4AFF91)' : 'var(--text-muted)',
              textTransform: 'uppercase', cursor: 'pointer', marginBottom: -1,
            }}>
              {t === 'dump' ? '◍ brain.dump' : `⚙ triage.queue [${items.length}]`}
            </button>
          )
        })}
      </div>

      {tab === 'dump'
        ? <DumpPane onSent={refresh} />
        : <TriagePane items={items} onChange={(next) => { setItems(next); start(() => router.refresh()) }} />}
    </div>
  )
}

function DumpPane({ onSent }: { onSent: () => void }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(0)
  const [streak, setStreak] = useState<string[]>([])
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = async () => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setText('')
    setStreak(s => [...lines, ...s].slice(0, 6))
    await Promise.all(
      lines.map(raw =>
        fetch('/api/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw, source: 'text' }),
        })
      )
    )
    setSent(n => n + lines.length)
    ref.current?.focus()
    onSent()
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
        // dump everything · one thought per line · ai will sort it later
      </div>
      <textarea
        ref={ref}
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit() }
        }}
        placeholder={'fix bathroom faucet\nemail kara about q3 numbers\nidea: weekly retro template\n...'}
        rows={10}
        style={{
          width: '100%', resize: 'vertical',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-mid)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 1.55,
          padding: 14, outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          ⌘/CTRL + ENTER to send all lines ·{' '}
          {sent > 0 && <span style={{ color: 'var(--pip-green, #0CFF70)' }}>✓ {sent} captured this session</span>}
        </div>
        <button onClick={submit} disabled={!text.trim()} style={{
          padding: '8px 18px',
          background: text.trim() ? 'rgba(12,255,112,0.1)' : 'transparent',
          border: '1px solid ' + (text.trim() ? 'var(--pip-green, #0CFF70)' : 'var(--border-mid)'),
          color: text.trim() ? 'var(--pip-green, #0CFF70)' : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
          textTransform: 'uppercase', cursor: text.trim() ? 'pointer' : 'not-allowed',
        }}>▶ send to inbox</button>
      </div>

      {streak.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            // last sent
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {streak.map((s, i) => (
              <li key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--text-secondary)',
                opacity: 1 - (i * 0.12),
                paddingLeft: 14, position: 'relative',
              }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--pip-green, #0CFF70)' }}>✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TriagePane({ items, onChange }: { items: InboxItem[]; onChange: (next: InboxItem[]) => void }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: 28, color: 'var(--pip-bright, #4AFF91)', marginBottom: 8 }}>INBOX ZERO</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>nothing to triage. dump some thoughts.</div>
      </div>
    )
  }

  const accept = async (id: string, override = {}) => {
    onChange(items.filter(i => i.id !== id))
    await fetch(`/api/inbox/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(override) })
  }
  const dismiss = async (id: string) => {
    onChange(items.filter(i => i.id !== id))
    await fetch(`/api/inbox/${id}`, { method: 'DELETE' })
  }
  const acceptAll = async () => {
    const ids = items.map(i => i.id)
    onChange([])
    await Promise.all(ids.map(id =>
      fetch(`/api/inbox/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    ))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          // {items.length} unsorted · review proposals or override
        </div>
        <button onClick={acceptAll} style={{
          padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'transparent', border: '1px solid var(--border-mid)',
          color: 'var(--text-muted)', cursor: 'pointer',
        }}>⚡ accept all</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => <TriageRow key={item.id} item={item} onAccept={accept} onDismiss={dismiss} />)}
      </div>
    </div>
  )
}

function TriageRow({ item, onAccept, onDismiss }: {
  item: InboxItem
  onAccept: (id: string, override?: object) => void
  onDismiss: (id: string) => void
}) {
  const [bucket, setBucket] = useState(item.aiBucket ?? 'NEXT')
  const [category, setCategory] = useState(item.aiCategory ?? 'WORK')

  return (
    <div style={{
      padding: 14,
      background: 'rgba(199,125,255,0.04)',
      border: '1px solid rgba(199,125,255,0.25)',
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--pip-purple, #C77DFF)', letterSpacing: '0.18em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, background: 'var(--pip-purple, #C77DFF)', boxShadow: '0 0 8px #C77DFF', display: 'inline-block' }} />
          ghost.ai proposal
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)', marginTop: 4 }}>
          › "{item.raw}"
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--text-primary)', margin: '8px 0' }}>
          {item.aiTitle ?? <span style={{ color: 'var(--text-muted)' }}>(triaging…)</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['NOW', 'NEXT', 'LATER'] as const).map(b => (
            <button key={b} onClick={() => setBucket(b)} style={chipStyle(bucket === b, b === 'NOW' ? 'red' : b === 'NEXT' ? 'amber' : 'ghost')}>
              → {b}
            </button>
          ))}
          <span style={{ width: 1, height: 14, background: 'var(--border-subtle)', margin: '0 4px', display: 'inline-block' }} />
          {(['WORK', 'HOME', 'WRITING', 'PERSONAL'] as const).map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              ...chipStyle(category === c, 'ghost'),
              borderColor: category === c ? 'var(--text-secondary)' : 'var(--border-subtle)',
            }}>
              {c.toLowerCase()}
            </button>
          ))}
        </div>
        {item.aiReason && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pip-purple, #C77DFF)', marginTop: 8, opacity: 0.75 }}>
            ⊙ {item.aiReason}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 110 }}>
        <button onClick={() => onAccept(item.id, { bucket, category })} style={actionStyle('accept')}>✓ ACCEPT</button>
        <button onClick={() => onDismiss(item.id)} style={actionStyle('reject')}>✕ DISMISS</button>
      </div>
    </div>
  )
}

function chipStyle(active: boolean, tone: 'red' | 'amber' | 'ghost') {
  const c = tone === 'red' ? 'var(--pip-red, #FF3333)' : tone === 'amber' ? 'var(--pip-amber, #FFB000)' : 'var(--pip-green, #0CFF70)'
  return {
    padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    border: '1px solid ' + (active ? c : 'var(--border-subtle)'),
    background: active ? `${c}1a` : 'transparent',
    color: active ? c : 'var(--text-muted)',
    cursor: 'pointer',
  }
}

function actionStyle(kind: 'accept' | 'reject') {
  const m = {
    accept: { c: 'var(--pip-green, #0CFF70)', b: 'rgba(12,255,112,0.4)' },
    reject: { c: 'var(--pip-red, #FF3333)',   b: 'rgba(255,51,51,0.4)' },
  }[kind]
  return {
    padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    background: 'transparent', cursor: 'pointer',
    border: '1px solid ' + m.b, color: m.c,
  }
}
