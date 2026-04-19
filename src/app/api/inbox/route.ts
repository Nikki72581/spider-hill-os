import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.inboxItem.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.raw?.trim()) {
    return NextResponse.json({ error: 'raw required' }, { status: 400 })
  }
  const item = await prisma.inboxItem.create({
    data: {
      raw:    body.raw,
      source: body.source ?? 'text',
    },
  })

  // Fire-and-forget triage (stub — replace with LLM call)
  fetch(new URL('/api/inbox/triage', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: item.id }),
  }).catch(() => {})

  return NextResponse.json(item, { status: 201 })
}
