'use client'
import type { Task } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Phase = 'idle' | 'running' | 'paused' | 'done'

const catClass: Record<string, string> = {
  WORK: 'tag-work', HOME: 'tag-home', WRITING: 'tag-writing', PERSONAL: 'tag-personal',
}

export default function FocusClient({ task, siblings }: { task: Task | null; siblings: Task[] }) {
  const router = useRouter()
  const [duration, setDuration] = useState(25 * 60)
  const [remaining, setRemaining] = useState(25 * 60)
  const [phase, setPhase] = useState<Phase>('idle')
  const [distractions, setDistractions] = useState(0)
  const [parking, setParking] = useState('')
  const [parked, setParked] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (phase !== 'running') return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          setPhase('done')
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  const start = () => setPhase('running')
  const pause = () => setPhase('paused')
  const resume = () => setPhase('running')
  const reset = () => { setPhase('idle'); setRemaining(duration); setDistractions(0); setParked([]) }
  const setDur = (mins: number) => { setDuration(mins * 60); setRemaining(mins * 60); setPhase('idle') }

  const complete = async () => {
    if (!task) return
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: 'DONE', completedAt: new Date().toISOString() }),
    })
    const focused = Math.round((duration - remaining) / 60)
    const xp = Math.min(120, 10 + focused * 5)
    const cur = parseInt(localStorage.getItem('shos:xp') ?? '0', 10)
    localStorage.setItem('shos:xp', String(cur + xp))
    router.push('/dashboard')
  }

  const park = async () => {
    if (!parking.trim()) return
    setParked(p => [parking.trim(), ...p].slice(0, 8))
    await fetch('/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: parking.trim(), source: 'focus' }),
    })
    setParking('')
    setDistractions(d => d + 1)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0

  if (!task) {
    return (
      <div style={{ maxWidth: 720, margin: '60px auto', textAlign: 'center', padding: 40, border: '1px dashed var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-vt)', fontSize: 32, color: 'var(--pip-bright, #4AFF91)', marginBottom: 12 }}>NO TASKS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
          queue is empty. capture something first.
        </div>
        <Link href="/capture" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pip-green, #0CFF70)', letterSpacing: '0.14em' }}>
          → BRAIN.DUMP
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pip-red, #FF3333)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
          ■ focus.now · single task
        </div>
        <h1 style={{
          fontFamily: 'var(--font-vt)',
          fontSize: 40, lineHeight: 1.1,
          color: 'var(--pip-bright, #4AFF91)',
          textShadow: '0 0 12px rgba(74,255,145,0.4)',
          textTransform: 'uppercase', letterSpacing: '0.02em',
          margin: '0 0 10px',
        }}>
          {task.title}
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`tag ${catClass[task.category]}`}>{task.category.toLowerCase()}</span>
          {task.minutes && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              estimated {task.minutes}m
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>· bucket {task.bucket}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <div style={{
            width: 280, height: 280, borderRadius: '50%',
            background: `conic-gradient(var(--pip-green, #0CFF70) ${pct}%, rgba(12,255,112,0.06) 0)`,
            position: 'relative', display: 'grid', placeItems: 'center',
            filter: phase === 'running' ? 'drop-shadow(0 0 18px rgba(12,255,112,0.4))' : 'none',
            transition: 'filter 0.5s',
          }}>
            <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-vt)',
                fontSize: 64, color: phase === 'done' ? 'var(--pip-amber, #FFB000)' : 'var(--pip-bright, #4AFF91)',
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                textShadow: '0 0 14px rgba(74,255,145,0.45)',
              }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>
                {phase === 'idle' ? 'ready' : phase === 'running' ? 'focused' : phase === 'paused' ? 'paused' : 'session complete'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {phase === 'idle' && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                // session length
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[10, 15, 25, 45, 60].map(m => (
                  <button key={m} onClick={() => setDur(m)} style={{
                    flex: 1, padding: '10px 0',
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    background: duration === m * 60 ? 'rgba(12,255,112,0.12)' : 'transparent',
                    border: '1px solid ' + (duration === m * 60 ? 'var(--pip-green, #0CFF70)' : 'var(--border-mid)'),
                    color: duration === m * 60 ? 'var(--pip-green, #0CFF70)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}>{m}m</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {phase === 'idle' && (
              <button onClick={start} style={primaryBtn}>▶ START FOCUS</button>
            )}
            {phase === 'running' && (
              <>
                <button onClick={pause} style={secondaryBtn}>⏸ PAUSE</button>
                <button onClick={complete} style={primaryBtn}>✓ DONE EARLY</button>
              </>
            )}
            {phase === 'paused' && (
              <>
                <button onClick={resume} style={primaryBtn}>▶ RESUME</button>
                <button onClick={reset} style={secondaryBtn}>↺ RESET</button>
              </>
            )}
            {phase === 'done' && (
              <>
                <button onClick={complete} style={primaryBtn}>✓ MARK DONE (+XP)</button>
                <button onClick={reset} style={secondaryBtn}>↺ ANOTHER ROUND</button>
              </>
            )}
          </div>

          <div style={{ marginTop: 6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              // park a distraction · sends to inbox · stays focused
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={parking}
                onChange={e => setParking(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && park()}
                placeholder="i should also..."
                style={{
                  flex: 1, padding: '8px 10px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-mid)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
                  outline: 'none',
                }}
              />
              <button onClick={park} disabled={!parking.trim()} style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid ' + (parking.trim() ? 'var(--pip-purple, #C77DFF)' : 'var(--border-mid)'),
                color: parking.trim() ? 'var(--pip-purple, #C77DFF)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                textTransform: 'uppercase', cursor: parking.trim() ? 'pointer' : 'not-allowed',
              }}>⊙ park</button>
            </div>
            {distractions > 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>
                parked {distractions} this session — good job not chasing them.
              </div>
            )}
          </div>
        </div>
      </div>

      {parked.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            // parked this session
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {parked.map((p, i) => (
              <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--pip-purple, #C77DFF)' }}>⊙</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {siblings.length > 0 && (
        <details style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          <summary style={{
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            ⇄ swap to a different task ({siblings.length})
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
            {siblings.map(s => (
              <Link key={s.id} href={`/focus?task=${s.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)', textDecoration: 'none',
              }}>
                <span style={{ color: s.bucket === 'NOW' ? 'var(--pip-red, #FF3333)' : s.bucket === 'NEXT' ? 'var(--pip-amber, #FFB000)' : 'var(--text-muted)', fontSize: 10, letterSpacing: '0.14em' }}>
                  {s.bucket}
                </span>
                <span style={{ flex: 1 }}>{s.title}</span>
                <span className={`tag ${catClass[s.category]}`}>{s.category.toLowerCase()}</span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  padding: '12px 18px',
  background: 'rgba(12,255,112,0.12)',
  border: '1px solid var(--pip-green, #0CFF70)',
  color: 'var(--pip-green, #0CFF70)',
  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em',
  textTransform: 'uppercase', cursor: 'pointer',
}
const secondaryBtn: React.CSSProperties = {
  padding: '12px 18px',
  background: 'transparent',
  border: '1px solid var(--border-mid)',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em',
  textTransform: 'uppercase', cursor: 'pointer',
}
