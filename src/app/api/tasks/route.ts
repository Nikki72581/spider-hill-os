import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status    = searchParams.get('status')
    const category  = searchParams.get('category')
    const filter    = searchParams.get('filter')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (category) where.category = category
    if (filter === 'today') {
      where.dueDate = { gte: today, lt: tomorrow }
      where.status = { in: ['OPEN', 'IN_PROGRESS'] }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(tasks)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title:    body.title,
        body:     body.body,
        status:   body.status   ?? 'OPEN',
        category: body.category ?? 'WORK',
        priority: body.priority ?? 'MEDIUM',
        dueDate:  body.dueDate  ? new Date(body.dueDate) : null,
        tags:     body.tags     ?? [],
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
