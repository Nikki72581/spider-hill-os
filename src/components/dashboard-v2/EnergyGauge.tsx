'use client'
import { useState, useEffect } from 'react'

const LEVELS = ['ZERO', 'LOW', 'OK', 'HI']
const COLORS = ['var(--pip-red, #FF3333)', 'var(--pip-amber, #FFB000)', 'var(--pip-green, #0CFF70)', 'var(--pip-green, #0CFF70)']

export default function EnergyGauge() {
  const [level, setLevel] = useState(2)
  useEffect(() => {
    const saved = localStorage.getItem('shos:energy')
    if (saved) setLevel(parseInt(saved, 10))
  }, [])
  const set = (l: number) => { setLevel(l); localStorage.setItem('shos:energy', String(l)) }

  const pct = (level / 3) * 100
  const color = COLORS[level]

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
        // energy · self-report
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `conic-gradient(${color} ${pct}%, rgba(12,255,112,0.08) 0)`,
          position: 'relative', display: 'grid', placeItems: 'center',
          filter: 'drop-shadow(0 0 10px rgba(12,255,112,0.35))',
        }}>
          <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-vt)', fontSize: 28, color: 'var(--pip-bright, #4AFF91)' }}>{LEVELS[level]}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.14em' }}>
              level {level}/3
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {[3,2,1,0].map(L => (
            <button key={L} onClick={() => set(L)}
              style={{
                padding: '4px 8px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                border: '1px solid ' + (L === level ? 'var(--pip-green, #0CFF70)' : 'var(--border-subtle)'),
                color: L === level ? 'var(--pip-green, #0CFF70)' : 'var(--text-muted)',
                background: L === level ? 'rgba(12,255,112,0.1)' : 'transparent',
                textAlign: 'left', letterSpacing: '0.08em',
                cursor: 'pointer', textTransform: 'uppercase',
              }}>
              {['zero', 'low', 'ok', 'high'][L]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', marginTop: 10, letterSpacing: '0.06em' }}>
        › showing {level === 0 ? '5-min wins only' : level === 1 ? 'low-effort tasks' : 'all open tasks'}
      </div>
    </div>
  )
}
