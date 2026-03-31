'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '12px 0' }}>
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
          <Button
            key={m.key}
            variant="ghost"
            onClick={() => setMode(m.key)}
            style={{
              flex: 1,
              padding: '8px',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
              background: mode === m.key ? 'var(--bg-overlay)' : 'transparent',
              color: mode === m.key ? m.color : 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              border: mode === m.key ? `0.5px solid ${m.color}44` : '0.5px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {/* Title */}
      <div style={{ marginBottom: '12px' }}>
        <Input
          type="text"
          placeholder={currentMode.placeholder}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSave()}
          autoFocus
          className="h-12 text-base"
          style={{
            fontSize: '16px',
            fontFamily: 'var(--font-mono)',
            borderColor: title ? `${currentMode.color}66` : undefined,
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Body */}
      <div style={{ marginBottom: '16px' }}>
        <Textarea
          placeholder="Add details (optional)..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{
            resize: 'vertical',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-mid)',
          }}
        />
      </div>

      {/* Mode-specific options */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {(mode === 'task' || mode === 'idea') && (
          <div style={{ flex: 1 }}>
            <Label className="sr-only">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)' }}>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="WRITING">Writing</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === 'task' && (
          <div style={{ flex: 1 }}>
            <Label className="sr-only">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)' }}>
                <SelectItem value="LOW">Low priority</SelectItem>
                <SelectItem value="MEDIUM">Medium priority</SelectItem>
                <SelectItem value="HIGH">High priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === 'kb' && (
          <div style={{ flex: 1 }}>
            <Label className="sr-only">Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)' }}>
                <SelectItem value="TECH">Tech</SelectItem>
                <SelectItem value="WORK">Work</SelectItem>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={!title.trim() || saving}
        className="w-full h-12"
        style={{
          background: done ? 'var(--neon-green)18' : `${currentMode.color}18`,
          border: `0.5px solid ${done ? 'var(--neon-green)' : currentMode.color}66`,
          color: done ? 'var(--neon-green)' : currentMode.color,
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          transition: 'all 0.2s',
        }}
      >
        {done ? '✓ Captured' : saving ? 'Saving...' : 'Capture →'}
      </Button>

      {/* Nav shortcuts */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '28px' }}>
        {[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/tasks',     label: 'Tasks' },
          { href: '/ideas',     label: 'Ideas' },
          { href: '/kb',        label: 'KB' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
