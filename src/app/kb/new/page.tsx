'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewKBPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', body: '', domain: 'TECH', tags: '' })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }),
    })
    router.push('/kb')
  }

  const domainColors: Record<string, string> = {
    TECH:     'var(--neon-cyan)',
    WORK:     'var(--neon-blue)',
    HOME:     'var(--neon-green)',
    PERSONAL: 'var(--neon-purple)',
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>New KB Entry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Markdown supported in the body.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. INItemSite virtual fields in Acumatica 25R1" autoFocus required
            style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Domain</label>
            <select value={form.domain} onChange={e => set('domain', e.target.value)}
              style={{ borderColor: `${domainColors[form.domain]}66` }}>
              <option value="TECH">Tech</option>
              <option value="WORK">Work</option>
              <option value="HOME">Home</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Tags</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="acumatica, sql, 25r1..." />
          </div>
        </div>

        {/* Body with preview toggle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Content (Markdown)</label>
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
              {form.body || <span style={{ color: 'var(--text-muted)' }}>Nothing to preview yet.</span>}
            </div>
          ) : (
            <textarea value={form.body} onChange={e => set('body', e.target.value)}
              placeholder={`## Overview\n\nWrite your knowledge here...\n\n## Notes\n\n- Key insight\n- Another point\n\n\`\`\`sql\nSELECT * FROM table\n\`\`\``}
              rows={14}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7 }} />
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
            {saving ? 'Saving...' : 'Save Entry →'}
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
