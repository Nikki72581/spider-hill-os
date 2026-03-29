import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import type { ArticleStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as ArticleStatus | null

    const articles = await prisma.article.findMany({
      where: status ? { status } : undefined,
      include: { sourceIdea: true },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(articles)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const article = await prisma.article.create({
      data: {
        title:    body.title,
        status:   body.status   ?? 'IDEA',
        platform: body.platform ?? null,
        body:     body.body     ?? null,
        notes:    body.notes    ?? null,
        dueDate:  body.dueDate  ? new Date(body.dueDate) : null,
        tags:     body.tags     ?? [],
        ideaId:   body.ideaId   ?? null,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
