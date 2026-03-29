'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Article, ArticleStatus } from '@/types'

const STAGES: { status: ArticleStatus; label: string; color: string }[] = [
  { status: 'IDEA',      label: 'Idea',       color: 'var(--neon-purple)' },
  { status: 'OUTLINE',   label: 'Outline',    color: 'var(--neon-blue)'   },
  { status: 'DRAFTING',  label: 'Drafting',   color: 'var(--neon-amber)'  },
  { status: 'EDITING',   label: 'Editing',    color: 'var(--neon-pink)'   },
  { status: 'PUBLISHED', label: 'Published',  color: 'var(--neon-green)'  },
]

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => { setArticles(data); setLoading(false) })
  }, [])

  const grouped = STAGES.reduce((acc, s) => {
    acc[s.status] = articles.filter(a => a.status === s.status)
    return acc
  }, {} as Record<ArticleStatus, Article[]>)

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            Writing Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            {articles.filter(a => a.status !== 'PUBLISHED' && a.status !== 'ARCHIVED').length} active · {articles.filter(a => a.status === 'PUBLISHED').length} published
          </p>
        </div>
        <Link href="/articles/new" style={{
          padding: '9px 18px',
          background: 'var(--neon-amber)12',
          border: '0.5px solid var(--neon-amber)44',
          color: 'var(--neon-amber)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          + New Article
        </Link>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Loading...</div>
      ) : (
        /* Kanban board */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          alignItems: 'start',
        }}>
          {STAGES.map(({ status, label, color }) => (
            <div key={status}>
              {/* Column header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                border: `0.5px solid ${color}33`,
                marginBottom: '8px',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  flex: 1,
                }}>
                  {label}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}>
                  {grouped[status]?.length ?? 0}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(grouped[status] ?? []).map(article => (
                  <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {article.title}
                      </p>
                      {article.platform && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                          → {article.platform}
                        </div>
                      )}
                      {article.dueDate && (
                        <div style={{ fontSize: '10px', color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>
                          Due {new Date(article.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      {article.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {article.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              color: 'var(--text-muted)',
                              background: 'var(--bg-elevated)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                            }}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}

                {/* Empty state */}
                {(grouped[status] ?? []).length === 0 && (
                  <div style={{
                    padding: '16px 12px',
                    border: `0.5px dashed ${color}22`,
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    color: 'var(--text-ghost)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
