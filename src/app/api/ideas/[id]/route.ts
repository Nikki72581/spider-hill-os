import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: { article: true },
    })
    if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(idea)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const idea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        ...(body.title    !== undefined && { title: body.title }),
        ...(body.body     !== undefined && { body: body.body }),
        ...(body.status   !== undefined && { status: body.status }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.tags     !== undefined && { tags: body.tags }),
      },
    })
    return NextResponse.json(idea)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.idea.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 })
  }
}
