import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Accept → promote inbox item to a Task, mark accepted
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const override = await req.json().catch(() => ({}))
  const item = await prisma.inboxItem.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const task = await prisma.task.create({
    data: {
      title:    override.title    ?? item.aiTitle ?? item.raw,
      category: override.category ?? item.aiCategory ?? 'WORK',
      bucket:   override.bucket   ?? item.aiBucket   ?? 'LATER',
      energy:   override.energy   ?? item.aiEnergy   ?? 2,
      minutes:  override.minutes  ?? item.aiMinutes  ?? null,
      dueDate:  override.dueDate  ?? item.aiDueDate  ?? null,
      status:   'OPEN',
      priority: 'MEDIUM',
      tags:     [],
    },
  })
  await prisma.inboxItem.update({
    where: { id: params.id },
    data: { status: 'accepted', acceptedAt: new Date() },
  })
  return NextResponse.json({ task })
}

// DELETE — dismiss the inbox item
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.inboxItem.update({
    where: { id: params.id },
    data: { status: 'dismissed' },
  })
  return NextResponse.json({ ok: true })
}
