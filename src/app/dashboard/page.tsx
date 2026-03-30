import { prisma } from '@/lib/prisma'
import { isToday } from 'date-fns'
import Link from 'next/link'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import WeatherWidget from '@/components/dashboard/WeatherWidget'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [tasks, ideas, articles, kbCount] = await Promise.all([
    prisma.task.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      take: 8,
    }),
    prisma.idea.findMany({
      where: { status: { not: 'PARKED' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.article.findMany({
      where: { status: { in: ['DRAFTING', 'EDITING', 'OUTLINE'] } },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    prisma.kBEntry.count(),
  ])

  const dueToday = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length

  return { tasks, ideas, articles, kbCount, dueToday }
}

const priorityColor: Record<string, string> = {
  URGENT: 'var(--neon-pink)',
  HIGH:   'var(--neon-amber)',
  MEDIUM: 'var(--neon-blue)',
  LOW:    'var(--text-muted)',
}

const categoryClass: Record<string, string> = {
  WORK:     'tag-work',
  HOME:     'tag-home',
  WRITING:  'tag-writing',
  PERSONAL: 'tag-personal',
}

const articleStatusColor: Record<string, string> = {
  OUTLINE:  'var(--neon-blue)',
  DRAFTING: 'var(--neon-amber)',
  EDITING:  'var(--neon-purple)',
}

export default async function DashboardPage() {
  const { tasks, ideas, articles, kbCount, dueToday } = await getDashboardData()

  return (
    <div style={{ maxWidth: '1100px' }}>
      <DashboardHeader />

      {/* Stats row */}
      <div className="grid-stats">
        {[
          { label: 'Open tasks',   value: tasks.length,  color: 'var(--neon-pink)',   href: '/tasks' },
          { label: 'Due today',    value: dueToday,      color: 'var(--neon-amber)',  href: '/tasks?filter=today' },
          { label: 'Active ideas', value: ideas.length,  color: 'var(--neon-purple)', href: '/ideas' },
          { label: 'KB entries',   value: kbCount,       color: 'var(--neon-green)',  href: '/kb' },
        ].map(({ label, value, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              borderColor: `${color}22`,
              cursor: 'pointer',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 800,
                color,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
                marginBottom: '6px',
              }}>
                {String(value).padStart(2, '0')}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
              }}>
                {label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid-dashboard-main">
        {/* Tasks */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ◻ Open Tasks
            </h2>
            <Link href="/tasks/new" style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-pink)',
              padding: '4px 10px',
              border: '0.5px solid var(--neon-pink)44',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--neon-pink)08',
            }}>
              + Add
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tasks.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No open tasks. Nice.</p>
            )}
            {tasks.map(task => (
              <Link key={task.id} href={`/tasks/${task.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                transition: 'background 0.1s',
                textDecoration: 'none',
                cursor: 'pointer',
              }}>
                {/* Priority dot */}
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: priorityColor[task.priority],
                  flexShrink: 0,
                }} />
                <span style={{
                  flex: 1,
                  fontSize: '13px',
                  color: task.status === 'DONE' ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {task.title}
                </span>
                <span className={`tag ${categoryClass[task.category]}`}>
                  {task.category.toLowerCase()}
                </span>
                {task.dueDate && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: isToday(new Date(task.dueDate)) ? 'var(--neon-amber)' : 'var(--text-muted)',
                  }}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Writing pipeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ◉ Writing Pipeline
              </h2>
              <Link href="/articles/new" style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--neon-amber)',
                padding: '4px 10px',
                border: '0.5px solid var(--neon-amber)44',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--neon-amber)08',
              }}>+ New</Link>
            </div>
            {articles.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No articles in progress.</p>
            )}
            {articles.map(article => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{
                display: 'block',
                padding: '10px 0',
                borderBottom: '0.5px solid var(--border-subtle)',
                textDecoration: 'none',
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {article.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: articleStatusColor[article.status] ?? 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    {article.status.toLowerCase()}
                  </span>
                  {article.platform && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      → {article.platform}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Ideas */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ◆ Ideas
              </h2>
              <Link href="/ideas/new" style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--neon-purple)',
                padding: '4px 10px',
                border: '0.5px solid var(--neon-purple)44',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--neon-purple)08',
              }}>+ Capture</Link>
            </div>
            {ideas.map(idea => (
              <Link key={idea.id} href={`/ideas/${idea.id}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                borderBottom: '0.5px solid var(--border-subtle)',
                textDecoration: 'none',
              }}>
                <span style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--neon-purple)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {idea.title}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}>
                  {idea.status.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>

          {/* Weather */}
          <WeatherWidget />

        </div>
      </div>
    </div>
  )
}
