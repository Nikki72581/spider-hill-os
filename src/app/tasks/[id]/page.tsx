'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Task } from '@/types'

const labelStyle = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
  marginBottom: '6px', textTransform: 'uppercase' as const,
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: '', body: '', status: '', category: '', priority: '', dueDate: '', tags: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/tasks/${params.id}`)
      .then(r => r.json())
      .then((t: Task) => {
        setTask(t)
        setForm({
          title:    t.title,
          body:     t.body ?? '',
          status:   t.status,
          category: t.category,
          priority: t.priority,
          dueDate:  t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '',
          tags:     t.tags.join(', '),
        })
      })
  }, [params.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    await fetch(`/api/tasks/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null,
      }),
    })
    setSaving(false)
    router.push('/tasks')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await fetch(`/api/tasks/${params.id}`, { method: 'DELETE' })
    router.push('/tasks')
  }

  if (!task) {
    return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '580px' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '12px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
          padding: 0, marginBottom: '12px', display: 'block',
        }}>← back</button>
        <h1 style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>Edit Task</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            autoFocus required style={{ fontSize: '16px', padding: '12px 14px' }} />
        </div>

        <div>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.body} onChange={e => set('body', e.target.value)}
            rows={4} style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="WORK">Work</option>
              <option value="HOME">Home</option>
              <option value="WRITING">Writing</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="comma separated" />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="submit" disabled={!form.title.trim() || saving} style={{
            flex: 1, padding: '12px', background: 'var(--neon-pink)15',
            border: '0.5px solid var(--neon-pink)55', color: 'var(--neon-pink)',
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
            border: '0.5px solid var(--neon-pink)33', color: 'var(--neon-pink)',
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
