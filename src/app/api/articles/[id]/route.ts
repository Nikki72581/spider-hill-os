import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: { sourceIdea: true, tasks: true },
    })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(body.title       !== undefined && { title: body.title }),
        ...(body.status      !== undefined && { status: body.status }),
        ...(body.platform    !== undefined && { platform: body.platform }),
        ...(body.body        !== undefined && { body: body.body }),
        ...(body.notes       !== undefined && { notes: body.notes }),
        ...(body.dueDate     !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(body.publishedAt !== undefined && { publishedAt: body.publishedAt ? new Date(body.publishedAt) : null }),
        ...(body.tags        !== undefined && { tags: body.tags }),
      },
    })
    return NextResponse.json(article)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.article.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
