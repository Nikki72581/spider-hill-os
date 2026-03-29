'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Article, ArticleStatus } from '@/types'

const labelStyle = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
  marginBottom: '6px', textTransform: 'uppercase' as const,
}

const STAGES: { status: ArticleStatus; label: string; color: string }[] = [
  { status: 'IDEA',      label: 'Idea',      color: 'var(--neon-purple)' },
  { status: 'OUTLINE',   label: 'Outline',   color: 'var(--neon-blue)'   },
  { status: 'DRAFTING',  label: 'Drafting',  color: 'var(--neon-amber)'  },
  { status: 'EDITING',   label: 'Editing',   color: 'var(--neon-pink)'   },
  { status: 'PUBLISHED', label: 'Published', color: 'var(--neon-green)'  },
]

const PLATFORMS = ['Medium', 'Junova Blog', 'LinkedIn', 'Substack', 'Internal', 'Other']

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [form, setForm] = useState({
    title: '', status: '', platform: '', notes: '', body: '', dueDate: '', tags: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then(r => r.json())
      .then((a: Article) => {
        setArticle(a)
        setForm({
          title:    a.title,
          status:   a.status,
          platform: a.platform ?? '',
          notes:    a.notes ?? '',
          body:     a.body ?? '',
          dueDate:  a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 10) : '',
          tags:     a.tags.join(', '),
        })
      })
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch(`/api/articles/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
      }),
    })
    setSaving(false)
    router.push('/articles')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this article?')) return
    setDeleting(true)
    await fetch(`/api/articles/${params.id}`, { method: 'DELETE' })
    router.push('/articles')
  }

  if (!article) {
    return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
  }

  const currentStage = STAGES.find(s => s.status === form.status)

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Edit Article
        </h1>

        {/* Pipeline stage selector */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {STAGES.map(s => (
            <button
              key={s.status}
              type="button"
              onClick={() => set('status', s.status)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                background: form.status === s.status ? 'var(--bg-overlay)' : 'transparent',
                border: form.status === s.status ? `0.5px solid ${s.color}55` : '0.5px solid var(--border-subtle)',
                color: form.status === s.status ? s.color : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Platform</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)}>
              <option value="">Select platform...</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Target Date</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes / Angle</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Who's the audience? What's the hook?" rows={3}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
        </div>

        <div>
          <label style={labelStyle}>Draft Body</label>
          <textarea value={form.body} onChange={e => set('body', e.target.value)}
            placeholder="Write the article here (Markdown supported)..." rows={10}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7 }} />
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="comma separated" />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" disabled={!form.title.trim() || saving} style={{
            flex: 1, padding: '12px',
            background: `${currentStage?.color ?? 'var(--neon-amber)'}15`,
            border: `0.5px solid ${currentStage?.color ?? 'var(--neon-amber)'}55`,
            color: currentStage?.color ?? 'var(--neon-amber)',
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
            border: '0.5px solid var(--neon-amber)33', color: 'var(--neon-amber)',
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
