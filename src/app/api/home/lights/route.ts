import { NextResponse } from 'next/server'

const { HUE_BRIDGE_IP, HUE_API_KEY } = process.env

export interface Light {
  id: string
  name: string
  on: boolean
  brightness: number   // 0–100
  room?: string
  source: 'hue'
  reachable: boolean
}

async function fetchHueLights(): Promise<Light[]> {
  if (!HUE_BRIDGE_IP || !HUE_API_KEY) return []

  try {
    const [lightsRes, groupsRes] = await Promise.all([
      fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_API_KEY}/lights`, { cache: 'no-store' }),
      fetch(`http://${HUE_BRIDGE_IP}/api/${HUE_API_KEY}/groups`, { cache: 'no-store' }),
    ])
    if (!lightsRes.ok) return []

    const lightsData = await lightsRes.json()
    const groupsData = groupsRes.ok ? await groupsRes.json() : {}

    // Map light ID → room name
    const lightRoom: Record<string, string> = {}
    for (const [, group] of Object.entries(groupsData) as [string, any][]) {
      if (group.type === 'Room' && Array.isArray(group.lights)) {
        for (const id of group.lights) {
          lightRoom[id] = group.name
        }
      }
    }

    return Object.entries(lightsData).map(([id, light]: [string, any]) => ({
      id: `hue-${id}`,
      name: light.name,
      on: light.state.on,
      brightness: Math.round((light.state.bri / 254) * 100),
      room: lightRoom[id],
      source: 'hue' as const,
      reachable: light.state.reachable ?? true,
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const lights = await fetchHueLights()

  // Group by room
  const rooms: Record<string, Light[]> = {}
  for (const light of lights) {
    const room = light.room ?? 'Other'
    if (!rooms[room]) rooms[room] = []
    rooms[room].push(light)
  }

  return NextResponse.json({
    lights,
    rooms,
    configured: {
      hue: !!(HUE_BRIDGE_IP && HUE_API_KEY),
    },
  })
}
