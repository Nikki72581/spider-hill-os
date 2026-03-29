import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q') ?? ''
  const domain = searchParams.get('domain')

  const where: Record<string, unknown> = {}
  if (domain) where.domain = domain

  if (q.trim()) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { body:  { contains: q, mode: 'insensitive' } },
      { tags:  { hasSome: [q.toLowerCase()] } },
    ]
  }

  const entries = await prisma.kBEntry.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await prisma.kBEntry.create({
    data: {
      title:  body.title,
      body:   body.body ?? '',
      domain: body.domain ?? 'TECH',
      tags:   body.tags  ?? [],
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
