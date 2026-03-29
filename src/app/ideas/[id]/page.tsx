'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Idea } from '@/types'

const labelStyle = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
  marginBottom: '6px', textTransform: 'uppercase' as const,
}

const statusColor: Record<string, string> = {
  RAW:        'var(--text-muted)',
  DEVELOPING: 'var(--neon-blue)',
  READY:      'var(--neon-green)',
  PARKED:     'var(--text-ghost)',
}

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [form, setForm] = useState({ title: '', body: '', status: '', category: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/ideas/${params.id}`)
      .then(r => r.json())
      .then((i: Idea) => {
        setIdea(i)
        setForm({
          title:    i.title,
          body:     i.body ?? '',
          status:   i.status,
          category: i.category,
          tags:     i.tags.join(', '),
        })
      })
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch(`/api/ideas/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }),
    })
    setSaving(false)
    router.push('/ideas')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this idea?')) return
    setDeleting(true)
    await fetch(`/api/ideas/${params.id}`, { method: 'DELETE' })
    router.push('/ideas')
  }

  if (!idea) {
    return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '620px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>Edit Idea</h1>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: statusColor[idea.status],
            border: `0.5px solid ${statusColor[idea.status]}44`,
            padding: '3px 8px', borderRadius: '4px',
          }}>
            {idea.status.toLowerCase()}
          </span>
        </div>
        {idea.article && (
          <p style={{ color: 'var(--neon-amber)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            → linked to article
          </p>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>The Idea *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div>
          <label style={labelStyle}>Expand on it</label>
          <textarea value={form.body} onChange={e => set('body', e.target.value)}
            placeholder="Why does this matter? What's the angle?" rows={6}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="RAW">Raw</option>
              <option value="DEVELOPING">Developing</option>
              <option value="READY">Ready</option>
              <option value="PARKED">Parked</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="WORK">Work</option>
              <option value="WRITING">Writing</option>
              <option value="HOME">Home</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tags</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="comma separated" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" disabled={!form.title.trim() || saving} style={{
            flex: 1, padding: '12px', background: 'var(--neon-purple)15',
            border: '0.5px solid var(--neon-purple)55', color: 'var(--neon-purple)',
            fontSize: '14px', fontWeight: 600, borderRadius: 'var(--radius-md)',
            cursor: form.title.trim() ? 'pointer' : 'not-allowed',
            opacity: form.title.trim() ? 1 : 0.5,
          }}>
            {saving ? 'Saving...' : 'Save Changes →'}
          </button>
          <button type="button" onClick={() => router.back()} style={{
            padding: '12px 20px', background: 'transparent',
            border: '0.5px solid var(--border-mid)', color: 'var(--text-secondary)',
            fontSize: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting} style={{
            padding: '12px 16px', background: 'transparent',
            border: '0.5px solid var(--neon-purple)33', color: 'var(--neon-purple)',
            fontSize: '13px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            opacity: 0.6,
          }}>
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  )
}
