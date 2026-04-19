import { prisma } from '@/lib/prisma'
import FocusClient from './FocusClient'

export const dynamic = 'force-dynamic'

export default async function FocusPage({
  searchParams,
}: { searchParams: Promise<{ task?: string }> }) {
  const params = await searchParams

  let task = null
  if (params.task) {
    task = await prisma.task.findUnique({ where: { id: params.task } })
  }
  if (!task) {
    task = await prisma.task.findFirst({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, bucket: 'NOW' },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    })
  }
  if (!task) {
    task = await prisma.task.findFirst({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    })
  }

  const siblings = task ? await prisma.task.findMany({
    where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, NOT: { id: task.id } },
    orderBy: [{ bucket: 'asc' }, { priority: 'desc' }],
    take: 5,
  }) : []

  return <FocusClient task={task} siblings={siblings} />
}
