import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import type { IdeaStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as IdeaStatus | null

    const ideas = await prisma.idea.findMany({
      where: status ? { status } : undefined,
      include: { article: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(ideas)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const idea = await prisma.idea.create({
      data: {
        title:    body.title,
        body:     body.body     ?? null,
        status:   body.status   ?? 'RAW',
        category: body.category ?? 'WORK',
        tags:     body.tags     ?? [],
      },
    })

    return NextResponse.json(idea, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 })
  }
}
