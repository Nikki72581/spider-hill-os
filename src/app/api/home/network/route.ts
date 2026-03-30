import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()
  try {
    await fetch('https://1.1.1.1', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    return NextResponse.json({ online: true, latencyMs: Date.now() - start })
  } catch {
    return NextResponse.json({ online: false, latencyMs: null })
  }
}
