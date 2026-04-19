import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { TaskCategory, TaskBucket } from '@prisma/client'

type Triage = {
  title: string
  category: TaskCategory
  bucket: TaskBucket
  energy: number
  minutes: number | null
  dueDate: Date | null
  reason: string
}

function classify(raw: string): Triage {
  const r = raw.toLowerCase()
  const hasDeadline = /(today|tomorrow|asap|overdue|deadline|due|by \w+)/i.test(raw)
  const isIdea = /^(idea[: ]|what if|maybe we|concept[: ])/i.test(raw)

  let category: TaskCategory = 'WORK'
  if (/\b(home|house|hue|nest|garage|yard|bill|electric|water)\b/.test(r)) category = 'HOME'
  else if (/\b(write|article|draft|post|blog)\b/.test(r)) category = 'WRITING'
  else if (/\b(mom|dad|family|friend|personal|dentist|doctor)\b/.test(r)) category = 'PERSONAL'

  const bucket: TaskBucket = hasDeadline ? 'NOW' : isIdea ? 'LATER' : 'NEXT'
  const energy = /\b(draft|refactor|research|investigate|build)\b/.test(r) ? 3
    : /\b(email|call|buy|pay|schedule|reply)\b/.test(r) ? 1 : 2
  const minutes = energy === 1 ? 10 : energy === 2 ? 30 : 60

  return {
    title: raw.charAt(0).toUpperCase() + raw.slice(1),
    category,
    bucket,
    energy,
    minutes,
    dueDate: null,
    reason: hasDeadline ? 'deadline detected' : isIdea ? 'idea, not task' : 'standard task',
  }
}

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  const item = await prisma.inboxItem.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const t = classify(item.raw)
  const updated = await prisma.inboxItem.update({
    where: { id },
    data: {
      aiTitle: t.title, aiCategory: t.category, aiBucket: t.bucket,
      aiEnergy: t.energy, aiMinutes: t.minutes, aiDueDate: t.dueDate,
      aiReason: t.reason,
    },
  })
  return NextResponse.json(updated)
}
