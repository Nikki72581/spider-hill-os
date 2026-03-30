import { NextResponse } from 'next/server'

// Haddam, CT 06438
const LAT = 41.4654
const LON = -72.5368

export const revalidate = 900 // cache for 15 minutes

export async function GET() {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(LAT))
  url.searchParams.set('longitude', String(LON))
  url.searchParams.set('current', [
    'temperature_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'relative_humidity_2m',
    'precipitation',
  ].join(','))
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('precipitation_unit', 'inch')
  url.searchParams.set('timezone', 'America/New_York')
  url.searchParams.set('forecast_days', '5')

  const res = await fetch(url.toString(), { next: { revalidate: 900 } })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
