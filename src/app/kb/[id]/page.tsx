'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { KBEntry } from '@/types'

const labelStyle = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
  marginBottom: '6px', textTransform: 'uppercase' as const,
}

const domainColors: Record<string, string> = {
  TECH:     'var(--neon-cyan)',
  WORK:     'var(--neon-blue)',
  HOME:     'var(--neon-green)',
  PERSONAL: 'var(--neon-purple)',
}

export default function KBEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [entry, setEntry] = useState<KBEntry | null>(null)
  const [form, setForm] = useState({ title: '', body: '', domain: 'TECH', tags: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/kb/${params.id}`)
      .then(r => r.json())
      .then((e: KBEntry) => {
        setEntry(e)
        setForm({
          title:  e.title,
          body:   e.body,
          domain: e.domain,
          tags:   e.tags.join(', '),
        })
      })
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch(`/api/kb/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }),
    })
    setSaving(false)
    router.push('/kb')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this KB entry?')) return
    setDeleting(true)
    await fetch(`/api/kb/${params.id}`, { method: 'DELETE' })
    router.push('/kb')
  }

  if (!entry) {
    return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>Edit KB Entry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Updated {new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Domain</label>
            <select value={form.domain} onChange={e => set('domain', e.target.value)}
              style={{ borderColor: `${domainColors[form.domain]}66` }}>
              <option value="TECH">Tech</option>
              <option value="WORK">Work</option>
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

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Content (Markdown)</label>
            <button type="button" onClick={() => setPreview(p => !p)} style={{
              background: 'none', border: '0.5px solid var(--border-subtle)',
              color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)',
              padding: '3px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}>
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div style={{
              background: 'var(--bg-elevated)', border: '0.5px solid var(--border-mid)',
              borderRadius: 'var(--radius-sm)', padding: '12px 14px', minHeight: '200px',
              fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap',
            }}>
              {form.body || <span style={{ color: 'var(--text-muted)' }}>Nothing to preview.</span>}
            </div>
          ) : (
            <textarea value={form.body} onChange={e => set('body', e.target.value)}
              rows={14} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7 }} />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" disabled={!form.title.trim() || saving} style={{
            flex: 1, padding: '12px', background: 'var(--neon-green)15',
            border: '0.5px solid var(--neon-green)55', color: 'var(--neon-green)',
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
            border: '0.5px solid var(--neon-green)33', color: 'var(--neon-green)',
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
