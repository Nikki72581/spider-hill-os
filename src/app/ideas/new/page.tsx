'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewIdeaPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', body: '', category: 'WORK', tags: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: 'RAW',
      }),
    })
    router.push('/ideas')
  }

  return (
    <div style={{ maxWidth: '580px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>Capture Idea</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Get it out of your head. You can develop it later.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>The idea *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="What's the spark?" autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Expand on it</label>
          <textarea value={form.body} onChange={e => set('body', e.target.value)}
            placeholder="Why does this matter? What's the angle? What do you want to say?" rows={6}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.7 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="WORK">Work</option>
              <option value="WRITING">Writing</option>
              <option value="HOME">Home</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Tags</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="erp, medium, saas..." />
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
            {saving ? 'Saving...' : 'Capture Idea →'}
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
