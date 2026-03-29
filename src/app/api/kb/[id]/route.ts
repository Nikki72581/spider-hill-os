import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entry = await prisma.kBEntry.findUnique({ where: { id: params.id } })
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(entry)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch KB entry' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const entry = await prisma.kBEntry.update({
      where: { id: params.id },
      data: {
        ...(body.title  !== undefined && { title: body.title }),
        ...(body.body   !== undefined && { body: body.body }),
        ...(body.domain !== undefined && { domain: body.domain }),
        ...(body.tags   !== undefined && { tags: body.tags }),
      },
    })
    return NextResponse.json(entry)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update KB entry' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.kBEntry.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete KB entry' }, { status: 500 })
  }
}
