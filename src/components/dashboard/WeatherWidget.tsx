'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  current: {
    temperature_2m:      number
    apparent_temperature: number
    weather_code:        number
    wind_speed_10m:      number
    wind_direction_10m:  number
    relative_humidity_2m: number
    precipitation:       number
  }
  daily: {
    time:                  string[]
    temperature_2m_max:    number[]
    temperature_2m_min:    number[]
    weather_code:          number[]
    precipitation_sum:     number[]
  }
}

// WMO weather codes → label + emoji
function describeCode(code: number): { label: string; icon: string } {
  if (code === 0)              return { label: 'Clear',          icon: '☀' }
  if (code === 1)              return { label: 'Mostly clear',   icon: '🌤' }
  if (code === 2)              return { label: 'Partly cloudy',  icon: '⛅' }
  if (code === 3)              return { label: 'Overcast',       icon: '☁' }
  if (code <= 48)              return { label: 'Foggy',          icon: '🌫' }
  if (code <= 55)              return { label: 'Drizzle',        icon: '🌦' }
  if (code <= 65)              return { label: 'Rain',           icon: '🌧' }
  if (code <= 77)              return { label: 'Snow',           icon: '❄' }
  if (code <= 82)              return { label: 'Rain showers',   icon: '🌧' }
  if (code <= 86)              return { label: 'Snow showers',   icon: '🌨' }
  if (code === 95)             return { label: 'Thunderstorm',   icon: '⛈' }
  return                              { label: 'Thunderstorm',   icon: '⛈' }
}

function windDirection(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function WeatherWidget() {
  const [data, setData]     = useState<WeatherData | null>(null)
  const [error, setError]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="card" style={{ padding: '20px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
        fetching weather…
      </span>
    </div>
  )

  if (error || !data) return (
    <div className="card" style={{ padding: '20px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>
        weather unavailable
      </span>
    </div>
  )

  const { current, daily } = data
  const { label, icon } = describeCode(current.weather_code)

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--neon-cyan)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Haddam, CT
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>
          06438
        </span>
      </div>

      {/* Current conditions */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
        {/* Temp */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '48px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {Math.round(current.temperature_2m)}°
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1,
              marginBottom: '4px',
            }}>F</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}>
            feels {Math.round(current.apparent_temperature)}°
          </div>
        </div>

        {/* Icon + condition */}
        <div style={{ marginBottom: '4px' }}>
          <div style={{ fontSize: '32px', lineHeight: 1, marginBottom: '4px' }}>{icon}</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            {label}
          </div>
        </div>

        {/* Details */}
        <div style={{ marginLeft: 'auto', textAlign: 'right', marginBottom: '4px' }}>
          {[
            { label: 'Humidity', value: `${current.relative_humidity_2m}%` },
            { label: 'Wind',     value: `${Math.round(current.wind_speed_10m)} mph ${windDirection(current.wind_direction_10m)}` },
            { label: 'Precip',   value: `${current.precipitation}"` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '0.5px solid var(--border-subtle)', marginBottom: '14px' }} />

      {/* 5-day forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        {daily.time.slice(0, 5).map((dateStr, i) => {
          const d = new Date(dateStr + 'T12:00:00')
          const { icon: dayIcon } = describeCode(daily.weather_code[i])
          const isToday = i === 0
          return (
            <div key={dateStr} style={{
              textAlign: 'center',
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: isToday ? 'var(--bg-elevated)' : 'transparent',
              border: isToday ? '0.5px solid var(--border-mid)' : '0.5px solid transparent',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: isToday ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                letterSpacing: '0.06em',
                marginBottom: '6px',
                textTransform: 'uppercase' as const,
              }}>
                {isToday ? 'Today' : DAY_LABELS[d.getDay()]}
              </div>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>{dayIcon}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {Math.round(daily.temperature_2m_max[i])}°
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {Math.round(daily.temperature_2m_min[i])}°
                </span>
              </div>
              {daily.precipitation_sum[i] > 0 && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--neon-blue)',
                  marginTop: '4px',
                }}>
                  {daily.precipitation_sum[i]}&quot;
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
