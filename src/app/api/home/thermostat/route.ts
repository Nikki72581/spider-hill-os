import { NextResponse } from 'next/server'

const {
  NEST_PROJECT_ID,
  NEST_CLIENT_ID,
  NEST_CLIENT_SECRET,
  NEST_REFRESH_TOKEN,
} = process.env

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: NEST_REFRESH_TOKEN!,
      client_id: NEST_CLIENT_ID!,
      client_secret: NEST_CLIENT_SECRET!,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Token refresh failed')
  const { access_token } = await res.json()
  return access_token
}

function celsiusToF(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

export async function GET() {
  if (!NEST_PROJECT_ID || !NEST_CLIENT_ID || !NEST_CLIENT_SECRET || !NEST_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  try {
    const token = await getAccessToken()
    const res = await fetch(
      `https://smartdevicemanagement.googleapis.com/v1/enterprises/${NEST_PROJECT_ID}/devices`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`SDM API ${res.status}`)
    const { devices } = await res.json()

    const thermostat = devices?.find((d: any) => d.type === 'sdm.devices.types.THERMOSTAT')
    if (!thermostat) return NextResponse.json({ error: 'No thermostat found' }, { status: 404 })

    const traits = thermostat.traits
    const ambientC: number | undefined = traits['sdm.devices.traits.Temperature']?.ambientTemperatureCelsius
    const humidity: number | undefined = traits['sdm.devices.traits.Humidity']?.ambientHumidityPercent
    const hvacStatus: string | undefined = traits['sdm.devices.traits.ThermostatHvac']?.status
    const mode: string | undefined = traits['sdm.devices.traits.ThermostatMode']?.mode
    const setpoint = traits['sdm.devices.traits.ThermostatTemperatureSetpoint']
    const room: string = thermostat.parentRelations?.[0]?.displayName ?? 'Thermostat'

    let targetF: number | null = null
    if (setpoint?.heatCelsius != null) targetF = celsiusToF(setpoint.heatCelsius)
    else if (setpoint?.coolCelsius != null) targetF = celsiusToF(setpoint.coolCelsius)

    return NextResponse.json({
      ambientF: ambientC != null ? celsiusToF(ambientC) : null,
      humidity: humidity ?? null,
      hvacStatus: hvacStatus ?? 'OFF',   // HEATING | COOLING | OFF
      mode: mode ?? 'OFF',               // HEAT | COOL | HEATCOOL | OFF
      targetF,
      room,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
