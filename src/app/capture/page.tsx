'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'task' | 'idea' | 'kb'

const modes: { key: Mode; label: string; color: string; placeholder: string }[] = [
  { key: 'task', label: '◻ Task',    color: 'var(--neon-pink)',   placeholder: 'What needs doing...' },
  { key: 'idea', label: '◆ Idea',    color: 'var(--neon-purple)', placeholder: 'What are you thinking...' },
  { key: 'kb',   label: '◎ KB Note', color: 'var(--neon-green)',  placeholder: 'What do you want to remember...' },
]

export default function CapturePage() {
  const [mode, setMode] = useState<Mode>('task')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('WORK')
  const [priority, setPriority] = useState('MEDIUM')
  const [domain, setDomain] = useState('TECH')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const currentMode = modes.find(m => m.key === mode)!

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)

    const endpoints: Record<Mode, string> = {
      task: '/api/tasks',
      idea: '/api/ideas',
      kb:   '/api/kb',
    }

    const payloads: Record<Mode, object> = {
      task: { title, body, category, priority, status: 'OPEN' },
      idea: { title, body, category, status: 'RAW' },
      kb:   { title, body, domain },
    }

    await fetch(endpoints[mode], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloads[mode]),
    })

    setSaving(false)
    setDone(true)
    setTitle('')
    setBody('')
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <div style={{
      maxWidth: '560px',
      margin: '0 auto',
      padding: '12px 0',
    }}>
      {/* Mode switcher */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '24px',
        background: 'var(--bg-elevated)',
        border: '0.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
      }}>
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              background: mode === m.key ? 'var(--bg-overlay)' : 'transparent',
              color: mode === m.key ? m.color : 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              border: mode === m.key ? `0.5px solid ${m.color}44` : '0.5px solid transparent',
              transition: 'all 0.15s',
              cursor: 'pointer',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder={currentMode.placeholder}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSave()}
          autoFocus
          style={{
            fontSize: '16px',
            padding: '12px 14px',
            borderColor: title ? `${currentMode.color}66` : undefined,
          }}
        />
      </div>

      {/* Body */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          placeholder="Add details (optional)..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      </div>

      {/* Mode-specific options */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {(mode === 'task' || mode === 'idea') && (
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option value="WORK">Work</option>
            <option value="HOME">Home</option>
            <option value="WRITING">Writing</option>
            <option value="PERSONAL">Personal</option>
          </select>
        )}

        {mode === 'task' && (
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ flex: 1 }}>
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
            <option value="URGENT">Urgent</option>
          </select>
        )}

        {mode === 'kb' && (
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{ flex: 1 }}>
            <option value="TECH">Tech</option>
            <option value="WORK">Work</option>
            <option value="HOME">Home</option>
            <option value="PERSONAL">Personal</option>
          </select>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!title.trim() || saving}
        style={{
          width: '100%',
          padding: '12px',
          background: done
            ? 'var(--neon-green)18'
            : `${currentMode.color}18`,
          border: `0.5px solid ${done ? 'var(--neon-green)' : currentMode.color}66`,
          color: done ? 'var(--neon-green)' : currentMode.color,
          fontSize: '14px',
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          cursor: title.trim() ? 'pointer' : 'not-allowed',
          opacity: title.trim() ? 1 : 0.5,
          transition: 'all 0.2s',
          fontFamily: 'var(--font-display)',
        }}
      >
        {done ? '✓ Captured' : saving ? 'Saving...' : 'Capture →'}
      </button>

      {/* Nav shortcuts */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '28px',
      }}>
        {[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/tasks',     label: 'Tasks' },
          { href: '/ideas',     label: 'Ideas' },
          { href: '/kb',        label: 'KB' },
        ].map(({ href, label }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
