import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(body.title    !== undefined && { title: body.title }),
      ...(body.body     !== undefined && { body: body.body }),
      ...(body.status   !== undefined && { status: body.status }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.dueDate  !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.tags     !== undefined && { tags: body.tags }),
    },
  })
  return NextResponse.json(task)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
