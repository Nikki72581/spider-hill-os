'use client'
import type { InboxItem } from '@prisma/client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const catClass: Record<string, string> = {
  WORK: 'tag-work', HOME: 'tag-home', WRITING: 'tag-writing', PERSONAL: 'tag-personal',
}

export default function InboxTriage({ items }: { items: InboxItem[] }) {
  const router = useRouter()
  const [, start] = useTransition()
  const [localItems, setLocalItems] = useState(items)

  const accept = async (id: string) => {
    setLocalItems(v => v.filter(i => i.id !== id))
    await fetch(`/api/inbox/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    start(() => router.refresh())
  }
  const dismiss = async (id: string) => {
    setLocalItems(v => v.filter(i => i.id !== id))
    await fetch(`/api/inbox/${id}`, { method: 'DELETE' })
    start(() => router.refresh())
  }

  if (localItems.length === 0) {
    return (
      <div style={{
        padding: 14, fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)',
      }}>
        inbox empty. brain dump something on /capture.
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 8,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          // ai.triage · confirm or correct
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          {localItems.length} UNSORTED
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {localItems.slice(0, 4).map(item => (
          <div key={item.id} style={{
            padding: 14,
            background: 'rgba(199,125,255,0.04)',
            border: '1px solid rgba(199,125,255,0.25)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--pip-purple, #C77DFF)', letterSpacing: '0.18em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, background: 'var(--pip-purple, #C77DFF)', boxShadow: '0 0 8px #C77DFF' }} />
              ghost.ai proposed
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-ghost)', marginTop: 6 }}>
              › &ldquo;{item.raw}&rdquo;
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-primary)', margin: '8px 0 6px' }}>
              {item.aiTitle ?? '(triaging...)'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {item.aiBucket && (
                <span style={{ padding: '3px 8px', border: '1px solid var(--border-strong)', background: 'rgba(12,255,112,0.08)', color: 'var(--pip-green, #0CFF70)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em' }}>
                  → {item.aiBucket}
                </span>
              )}
              {item.aiCategory && <span className={`tag ${catClass[item.aiCategory]}`}>{item.aiCategory.toLowerCase()}</span>}
            </div>
            {item.aiReason && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--pip-purple, #C77DFF)', marginBottom: 10, opacity: 0.85 }}>
                ⊙ {item.aiReason}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => accept(item.id)} style={btn('accept')}>✓ ACCEPT</button>
              <button style={btn('edit')}>⟲ EDIT</button>
              <button onClick={() => dismiss(item.id)} style={btn('reject')}>✕ DISMISS</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function btn(kind: 'accept' | 'edit' | 'reject') {
  const map = {
    accept: { c: 'var(--pip-green, #0CFF70)', b: 'rgba(12,255,112,0.4)' },
    edit:   { c: 'var(--text-muted)',           b: 'var(--border-mid)' },
    reject: { c: 'var(--pip-red, #FF3333)',     b: 'rgba(255,51,51,0.4)' },
  }[kind]
  return {
    padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 10,
    letterSpacing: '0.06em', background: 'transparent', cursor: 'pointer',
    border: '1px solid ' + map.b, color: map.c,
  } as const
}
