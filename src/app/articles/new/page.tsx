'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Idea } from '@/types'

const PLATFORMS = ['Medium', 'Junova Blog', 'LinkedIn', 'Substack', 'Internal', 'Other']

export default function NewArticlePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', notes: '', platform: '', dueDate: '', tags: '', ideaId: '',
  })
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch('/api/ideas?status=READY')
      .then(r => r.json())
      .then(setIdeas)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        status: 'OUTLINE',
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
        ideaId: form.ideaId || null,
      }),
    })
    router.push('/articles')
  }

  return (
    <div style={{ maxWidth: '620px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>New Article</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Track it through the writing pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Article working title" autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        {/* Link to idea */}
        {ideas.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
              Source Idea <span style={{ color: 'var(--text-ghost)' }}>(optional)</span>
            </label>
            <select value={form.ideaId} onChange={e => set('ideaId', e.target.value)}>
              <option value="">— No linked idea —</option>
              {ideas.map(idea => (
                <option key={idea.id} value={idea.id}>{idea.title}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Platform</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)}>
              <option value="">Select platform...</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Target Date</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Notes / Angle</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Who's the audience? What's the hook? Key points to hit..." rows={4}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Tags</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="erp, consulting, thought-leadership..." />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" disabled={!form.title.trim() || saving} style={{
            flex: 1, padding: '12px', background: 'var(--neon-amber)15',
            border: '0.5px solid var(--neon-amber)55', color: 'var(--neon-amber)',
            fontSize: '14px', fontWeight: 600, borderRadius: 'var(--radius-md)',
            cursor: form.title.trim() ? 'pointer' : 'not-allowed',
            opacity: form.title.trim() ? 1 : 0.5,
          }}>
            {saving ? 'Saving...' : 'Start Pipeline →'}
          </button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '12px 20px', background: 'transparent',
            border: '0.5px solid var(--border-mid)', color: 'var(--text-secondary)',
            fontSize: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
