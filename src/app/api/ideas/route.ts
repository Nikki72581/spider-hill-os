import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const ideas = await prisma.idea.findMany({
    where: status ? { status: status as never } : undefined,
    include: { article: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

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
}
