import { NextResponse } from 'next/server'

const { HOME_ASSISTANT_URL, HOME_ASSISTANT_TOKEN } = process.env

export interface HALight {
  entity_id: string
  name: string
  on: boolean
  brightness: number // 0–100
  unavailable: boolean
  color_temp?: number
}

export interface HAClimate {
  entity_id: string
  name: string
  current_temp: number | null
  target_temp: number | null
  hvac_action: string | null
  mode: string
}

export interface HASensor {
  entity_id: string
  name: string
  state: string
  unit: string | null
  device_class: string | null
}

export interface HABinarySensor {
  entity_id: string
  name: string
  on: boolean
  device_class: string | null
}

export interface HAData {
  configured: boolean
  reachable: boolean
  lights: HALight[]
  climate: HAClimate[]
  sensors: HASensor[]
  binary_sensors: HABinarySensor[]
}

async function haFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${HOME_ASSISTANT_URL}/api${path}`, {
      headers: {
        Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const EMPTY: HAData = { configured: false, reachable: false, lights: [], climate: [], sensors: [], binary_sensors: [] }

export async function GET() {
  if (!HOME_ASSISTANT_URL || !HOME_ASSISTANT_TOKEN) {
    return NextResponse.json(EMPTY)
  }

  const entities = await haFetch<Array<{ entity_id: string; state: string; attributes: Record<string, unknown> }>>('/states')
  if (!entities) {
    return NextResponse.json({ ...EMPTY, configured: true })
  }

  const lights: HALight[] = entities
    .filter(e => e.entity_id.startsWith('light.'))
    .map(e => ({
      entity_id: e.entity_id,
      name: (e.attributes.friendly_name as string) ?? e.entity_id.replace('light.', '').replace(/_/g, ' '),
      on: e.state === 'on',
      brightness: typeof e.attributes.brightness === 'number'
        ? Math.round((e.attributes.brightness / 255) * 100)
        : 0,
      unavailable: e.state === 'unavailable',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const climate: HAClimate[] = entities
    .filter(e => e.entity_id.startsWith('climate.'))
    .map(e => ({
      entity_id: e.entity_id,
      name: (e.attributes.friendly_name as string) ?? e.entity_id.replace('climate.', '').replace(/_/g, ' '),
      current_temp: typeof e.attributes.current_temperature === 'number' ? e.attributes.current_temperature : null,
      target_temp: typeof e.attributes.temperature === 'number' ? e.attributes.temperature : null,
      hvac_action: typeof e.attributes.hvac_action === 'string' ? e.attributes.hvac_action : null,
      mode: e.state,
    }))

  const SENSOR_DEVICE_CLASSES = new Set(['temperature', 'humidity', 'pressure', 'power', 'energy', 'battery', 'illuminance', 'co2', 'pm25', 'pm10'])
  const sensors: HASensor[] = entities
    .filter(e =>
      e.entity_id.startsWith('sensor.') &&
      e.state !== 'unavailable' &&
      e.state !== 'unknown' &&
      SENSOR_DEVICE_CLASSES.has(e.attributes.device_class as string)
    )
    .map(e => ({
      entity_id: e.entity_id,
      name: (e.attributes.friendly_name as string) ?? e.entity_id.replace('sensor.', '').replace(/_/g, ' '),
      state: e.state,
      unit: typeof e.attributes.unit_of_measurement === 'string' ? e.attributes.unit_of_measurement : null,
      device_class: typeof e.attributes.device_class === 'string' ? e.attributes.device_class : null,
    }))

  const BINARY_CLASSES = new Set(['door', 'window', 'motion', 'smoke', 'moisture', 'lock', 'presence', 'opening'])
  const binary_sensors: HABinarySensor[] = entities
    .filter(e =>
      e.entity_id.startsWith('binary_sensor.') &&
      e.state !== 'unavailable' &&
      BINARY_CLASSES.has(e.attributes.device_class as string)
    )
    .map(e => ({
      entity_id: e.entity_id,
      name: (e.attributes.friendly_name as string) ?? e.entity_id.replace('binary_sensor.', '').replace(/_/g, ' '),
      on: e.state === 'on',
      device_class: typeof e.attributes.device_class === 'string' ? e.attributes.device_class : null,
    }))

  return NextResponse.json({ configured: true, reachable: true, lights, climate, sensors, binary_sensors } satisfies HAData)
}
