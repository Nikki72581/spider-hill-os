import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const articles = await prisma.article.findMany({
    where: status ? { status: status as never } : undefined,
    include: { sourceIdea: true },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(articles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

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
}
