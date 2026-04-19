import { prisma } from '@/lib/prisma'
import { isToday, subDays, startOfDay } from 'date-fns'
import EnergyGauge from '@/components/dashboard-v2/EnergyGauge'
import StreakXP from '@/components/dashboard-v2/StreakXP'
import OneThingCard from '@/components/dashboard-v2/OneThingCard'
import Lane from '@/components/dashboard-v2/Lane'
import InboxTriage from '@/components/dashboard-v2/InboxTriage'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import UpcomingEvents from '@/components/dashboard-v2/UpcomingEvents'

export const dynamic = 'force-dynamic'

async function getData() {
  const [tasks, inbox, completions] = await Promise.all([
    prisma.task.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: [{ bucket: 'asc' }, { dueDate: 'asc' }, { priority: 'desc' }],
    }),
    prisma.inboxItem.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.task.findMany({
      where: { status: 'DONE', completedAt: { gte: subDays(startOfDay(new Date()), 14) } },
      select: { completedAt: true },
    }),
  ])

  const dayCounts: number[] = Array.from({ length: 14 }, () => 0)
  const today = startOfDay(new Date())
  completions.forEach(c => {
    if (!c.completedAt) return
    const diff = Math.floor((today.getTime() - startOfDay(c.completedAt).getTime()) / 86400000)
    if (diff >= 0 && diff < 14) dayCounts[13 - diff]++
  })
  let streak = 0
  for (let i = 13; i >= 0; i--) { if (dayCounts[i] > 0) streak++; else break }

  return {
    now:   tasks.filter(t => t.bucket === 'NOW'),
    next:  tasks.filter(t => t.bucket === 'NEXT'),
    later: tasks.filter(t => t.bucket === 'LATER'),
    dueToday: tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length,
    inbox,
    dayCounts,
    streak,
  }
}

export default async function DashboardPage() {
  const { now, next, later, inbox, dayCounts, streak } = await getData()
  const oneThing = now[0] ?? next[0] ?? null

  return (
    <div style={{ maxWidth: 1280 }}>
      <DashboardHeader />

      {/* HUD row */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <EnergyGauge />
        <StreakXP streak={streak} dayCounts={dayCounts} />
        <OneThingCard task={oneThing} />
      </div>

      {/* NOW / NEXT / LATER lanes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Lane bucket="NOW"   tasks={now} />
        <Lane bucket="NEXT"  tasks={next} />
        <Lane bucket="LATER" tasks={later} />
      </div>

      {/* Upcoming calendar events + AI triage inbox */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <UpcomingEvents />
        <InboxTriage items={inbox} />
      </div>
    </div>
  )
}
