import { NextRequest, NextResponse } from 'next/server'

const { HOME_ASSISTANT_URL, HOME_ASSISTANT_TOKEN } = process.env

export async function POST(req: NextRequest) {
  if (!HOME_ASSISTANT_URL || !HOME_ASSISTANT_TOKEN) {
    return NextResponse.json({ error: 'Home Assistant not configured' }, { status: 503 })
  }

  const body = await req.json() as {
    domain: string
    service: string
    entity_id?: string
    service_data?: Record<string, unknown>
  }

  const { domain, service, entity_id, service_data = {} } = body

  if (!domain || !service) {
    return NextResponse.json({ error: 'domain and service are required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${HOME_ASSISTANT_URL}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id, ...service_data }),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'HA service call failed' }, { status: res.status })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Home Assistant unreachable' }, { status: 503 })
  }
}
