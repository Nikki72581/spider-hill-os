'use client'
import { useState, useEffect } from 'react'

export default function StreakXP({ streak, dayCounts }: { streak: number; dayCounts: number[] }) {
  const [xp, setXp] = useState(0)
  useEffect(() => {
    setXp(parseInt(localStorage.getItem('shos:xp') ?? '1247', 10))
  }, [])
  const level = Math.floor(xp / 500) + 1
  const pct = ((xp % 500) / 500) * 100
  const max = Math.max(1, ...dayCounts)

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
        // momentum
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-vt)', fontSize: 44, color: 'var(--pip-amber, #FFB000)', textShadow: '0 0 14px rgba(255,176,0,0.5)', lineHeight: 1 }}>{streak}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>DAY STREAK</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48, marginTop: 10 }}>
            {dayCounts.map((c, i) => (
              <div key={i} style={{
                flex: 1,
                background: i === dayCounts.length - 1
                  ? 'linear-gradient(to top, var(--pip-amber, #FFB000), #FFD870)'
                  : 'linear-gradient(to top, var(--pip-dim, #0a7a3a), var(--pip-green, #0CFF70))',
                height: `${(c / max) * 100}%`,
                boxShadow: i === dayCounts.length - 1 ? '0 0 8px rgba(255,176,0,0.4)' : 'none',
                opacity: i === dayCounts.length - 1 ? 1 : 0.8,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-ghost)', marginTop: 4, letterSpacing: '0.08em' }}>
            <span>14D AGO</span><span>TODAY</span>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-vt)', fontSize: 32, color: 'var(--pip-green, #0CFF70)', textShadow: '0 0 10px rgba(12,255,112,0.5)', lineHeight: 1 }}>{xp}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>XP</div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', margin: '4px 0 6px', letterSpacing: '0.08em' }}>
            LV.{level} · {500 - (xp % 500)} TO LV.{level+1}
          </div>
          <div style={{ height: 6, background: 'rgba(12,255,112,0.08)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--pip-green, #0CFF70), var(--pip-bright, #4AFF91))', boxShadow: '0 0 8px rgba(12,255,112,0.6)' }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            TODAY
          </div>
          <div style={{ fontFamily: 'var(--font-vt)', fontSize: 22, color: 'var(--pip-bright, #4AFF91)', marginTop: 2 }}>
            {dayCounts[dayCounts.length - 1]}<span style={{ fontSize: 13, color: 'var(--text-muted)' }}> wins</span>
          </div>
        </div>
      </div>
    </div>
  )
}
