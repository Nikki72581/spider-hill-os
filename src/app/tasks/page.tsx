'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Task, TaskCategory, Priority } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const categories = ['ALL', 'WORK', 'HOME', 'WRITING', 'PERSONAL'] as const
const priorities: Priority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

const priorityColor: Record<string, string> = {
  URGENT: 'var(--neon-pink)',
  HIGH:   'var(--neon-amber)',
  MEDIUM: 'var(--neon-blue)',
  LOW:    'var(--text-secondary)',
}

const categoryColor: Record<string, string> = {
  WORK:     'var(--neon-blue)',
  HOME:     'var(--neon-green)',
  WRITING:  'var(--neon-amber)',
  PERSONAL: 'var(--neon-purple)',
}

function TasksContent() {
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<typeof categories[number]>('ALL')
  const [showDone, setShowDone] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'ALL') params.set('category', category)
    if (searchParams.get('filter') === 'today') params.set('filter', 'today')
    const res = await fetch(`/api/tasks?${params}`)
    const data: Task[] = await res.json()
    setTasks(data)
    setLoading(false)
  }, [category, searchParams])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const toggleStatus = async (task: Task) => {
    const next = task.status === 'DONE' ? 'OPEN' : 'DONE'
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t))
  }

  const visible = showDone ? tasks : tasks.filter(t => t.status !== 'DONE')
  const doneCount = tasks.filter(t => t.status === 'DONE').length

  return (
    <div style={{ maxWidth: '820px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '2px' }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            {visible.length} showing · {doneCount} done
          </p>
        </div>
        <Button asChild variant="outline" size="sm" style={{
          background: 'var(--neon-pink)12',
          border: '0.5px solid var(--neon-pink)44',
          color: 'var(--neon-pink)',
          fontFamily: 'var(--font-mono)',
        }}>
          <Link href="/tasks/new">+ New Task</Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {categories.map(cat => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              onClick={() => setCategory(cat)}
              style={{
                padding: '5px 12px',
                height: 'auto',
                background: category === cat ? 'var(--bg-overlay)' : 'transparent',
                border: category === cat ? '0.5px solid var(--border-mid)' : '0.5px solid var(--border-subtle)',
                color: category === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {cat.toLowerCase()}
            </Button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDone(s => !s)}
            style={{
              padding: '5px 12px',
              height: 'auto',
              background: showDone ? 'var(--neon-green)12' : 'transparent',
              border: showDone ? '0.5px solid var(--neon-green)44' : '0.5px solid var(--border-subtle)',
              color: showDone ? 'var(--neon-green)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {showDone ? '✓ showing done' : 'show done'}
          </Button>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '20px 0' }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
          Nothing here. <Link href="/tasks/new" style={{ color: 'var(--neon-pink)' }}>Add a task →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {priorities.map(p => {
            const group = visible.filter(t => t.priority === p)
            if (group.length === 0) return null
            return (
              <div key={p} style={{ marginBottom: '16px' }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: priorityColor[p],
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                }}>
                  {p.toLowerCase()}
                </div>
                {group.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border-subtle)',
                      marginBottom: '4px',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStatus(task)}
                      style={{
                        width: '18px',
                        height: '18px',
                        minWidth: '18px',
                        borderRadius: '4px',
                        border: `1px solid ${task.status === 'DONE' ? 'var(--neon-green)' : 'var(--border-strong)'}`,
                        background: task.status === 'DONE' ? 'var(--neon-green)22' : 'transparent',
                        color: 'var(--neon-green)',
                        fontSize: '11px',
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {task.status === 'DONE' && '✓'}
                    </Button>

                    {/* Title */}
                    <Link href={`/tasks/${task.id}`} style={{
                      flex: 1,
                      fontSize: '14px',
                      color: task.status === 'DONE' ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {task.title}
                    </Link>

                    {/* Category badge */}
                    <Badge variant="outline" style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: categoryColor[task.category] ?? 'var(--text-secondary)',
                      background: `${categoryColor[task.category] ?? 'var(--text-secondary)'}15`,
                      border: `0.5px solid ${categoryColor[task.category] ?? 'var(--text-secondary)'}33`,
                      padding: '1px 6px',
                    }}>
                      {task.category.toLowerCase()}
                    </Badge>

                    {/* Due date */}
                    {task.dueDate && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: (() => {
                          const d = new Date(task.dueDate)
                          const now = new Date()
                          if (d < now && task.status !== 'DONE') return 'var(--neon-pink)'
                          const today = new Date(); today.setHours(23,59,59)
                          if (d <= today) return 'var(--neon-amber)'
                          return 'var(--text-secondary)'
                        })(),
                        whiteSpace: 'nowrap',
                      }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '20px 0' }}>Loading...</div>}>
      <TasksContent />
    </Suspense>
  )
}
