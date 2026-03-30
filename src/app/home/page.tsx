'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Light } from '@/app/api/home/lights/route'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ThermostatData {
  ambientF: number | null
  humidity: number | null
  hvacStatus: 'HEATING' | 'COOLING' | 'OFF'
  mode: 'HEAT' | 'COOL' | 'HEATCOOL' | 'OFF'
  targetF: number | null
  room: string
}

interface LightsData {
  lights: Light[]
  rooms: Record<string, Light[]>
  configured: { hue: boolean }
}

interface NetworkData {
  online: boolean
  latencyMs: number | null
}

type Status<T> = { state: 'loading' } | { state: 'error'; msg: string } | { state: 'ok'; data: T }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hvacColor(status: string) {
  if (status === 'HEATING') return 'var(--neon-amber)'
  if (status === 'COOLING') return 'var(--neon-cyan)'
  return 'var(--text-muted)'
}

function hvacLabel(status: string) {
  if (status === 'HEATING') return 'heating'
  if (status === 'COOLING') return 'cooling'
  return 'idle'
}

function latencyColor(ms: number) {
  if (ms < 80)  return 'var(--neon-green)'
  if (ms < 200) return 'var(--neon-amber)'
  return 'var(--neon-pink)'
}

function sourceColor(_source: 'hue') {
  return 'var(--neon-amber)'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  )
}

function SetupCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="card" style={{ borderColor: 'var(--border-mid)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-cyan)', marginBottom: '12px', letterSpacing: '0.08em' }}>
        {title} — setup required
      </div>
      <ol style={{ paddingLeft: '16px', margin: 0 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.6 }}>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── Thermostat card ──────────────────────────────────────────────────────────

function ThermostatCard() {
  const [status, setStatus] = useState<Status<ThermostatData>>({ state: 'loading' })

  useEffect(() => {
    fetch('/api/home/thermostat')
      .then(r => r.json())
      .then(data => {
        if (data.error === 'not_configured') {
          setStatus({ state: 'error', msg: 'not_configured' })
        } else if (data.error) {
          setStatus({ state: 'error', msg: data.error })
        } else {
          setStatus({ state: 'ok', data })
        }
      })
      .catch(() => setStatus({ state: 'error', msg: 'fetch failed' }))
  }, [])

  if (status.state === 'loading') return (
    <div className="card" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
        reading thermostat…
      </span>
    </div>
  )

  if (status.state === 'error' && status.msg === 'not_configured') return (
    <SetupCard
      title="nest thermostat"
      steps={[
        'Go to console.nest.google.com and create a Device Access project ($5 one-time fee)',
        'In Google Cloud Console, create an OAuth 2.0 Client ID (Web application)',
        'Run the OAuth flow to obtain a refresh token',
        'Add to .env.local: NEST_PROJECT_ID, NEST_CLIENT_ID, NEST_CLIENT_SECRET, NEST_REFRESH_TOKEN',
      ]}
    />
  )

  if (status.state === 'error') return (
    <div className="card">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>
        thermostat unavailable — {status.msg}
      </span>
    </div>
  )

  const { ambientF, humidity, hvacStatus, targetF, room } = status.data

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {room.toLowerCase()}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: hvacColor(hvacStatus),
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: hvacColor(hvacStatus),
            display: 'inline-block',
            animation: hvacStatus !== 'OFF' ? 'neon-pulse 2s ease-in-out infinite' : undefined,
          }} />
          {hvacLabel(hvacStatus)}
        </span>
      </div>

      {/* Temp */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
            }}>
              {ambientF ?? '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '6px' }}>°F</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ambient
          </div>
        </div>

        <div style={{ paddingBottom: '18px' }}>
          {targetF != null && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: hvacColor(hvacStatus), lineHeight: 1 }}>
                {targetF}°
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                target
              </div>
            </div>
          )}
          {humidity != null && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, color: 'var(--neon-blue)', lineHeight: 1 }}>
                {humidity}%
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                humidity
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode bar */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        letterSpacing: '0.06em',
        border: '0.5px solid var(--border-subtle)',
      }}>
        mode: <span style={{ color: 'var(--text-primary)' }}>{status.data.mode.toLowerCase()}</span>
      </div>
    </div>
  )
}

// ─── Lights card ──────────────────────────────────────────────────────────────

function LightsCard() {
  const [status, setStatus] = useState<Status<LightsData>>({ state: 'loading' })

  useEffect(() => {
    fetch('/api/home/lights')
      .then(r => r.json())
      .then(data => setStatus({ state: 'ok', data }))
      .catch(() => setStatus({ state: 'error', msg: 'fetch failed' }))
  }, [])

  if (status.state === 'loading') return (
    <div className="card" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
        scanning lights…
      </span>
    </div>
  )

  if (status.state === 'error') return (
    <div className="card">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>lights unavailable</span>
    </div>
  )

  const { rooms, lights, configured } = status.data
  const noneConfigured = !configured.hue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Configured sources header */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {configured.hue && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--neon-amber)', letterSpacing: '0.06em', padding: '2px 8px', border: '0.5px solid var(--neon-amber)33', borderRadius: '4px', background: 'var(--neon-amber)10' }}>
            hue
          </span>
        )}
        {lights.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {lights.filter(l => l.on).length}/{lights.length} on
          </span>
        )}
      </div>

      {noneConfigured ? (
        <SetupCard
          title="philips hue"
          steps={[
            'Find your Hue bridge IP (check your router or the Hue app under Settings → My Hue system)',
            'POST to http://{bridge-ip}/api with body {"devicetype":"spiderhill#home"} while pressing the bridge button',
            'Copy the username from the response',
            'Add to .env.local: HUE_BRIDGE_IP, HUE_API_KEY',
          ]}
        />
      ) : lights.length === 0 ? (
        <div className="card">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            no lights found — check credentials
          </span>
        </div>
      ) : (
        Object.entries(rooms).map(([room, roomLights]) => {
          const onCount = roomLights.filter(l => l.on).length
          return (
            <div key={room} className="card" style={{ padding: '16px' }}>
              {/* Room header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {room.toLowerCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: onCount > 0 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                  {onCount}/{roomLights.length}
                </span>
              </div>

              {/* Lights list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roomLights.map(light => (
                  <div key={light.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* On/off dot */}
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: light.on ? 'var(--neon-green)' : 'var(--bg-overlay)',
                      border: light.on ? 'none' : '0.5px solid var(--border-mid)',
                      boxShadow: light.on ? '0 0 6px var(--neon-green)88' : 'none',
                    }} />
                    {/* Name */}
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: light.on ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {light.name}
                    </span>
                    {/* Brightness bar */}
                    {light.on && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${light.brightness}%`, background: sourceColor(light.source), borderRadius: '2px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', width: '28px', textAlign: 'right' }}>
                          {light.brightness}%
                        </span>
                      </div>
                    )}
                    {/* Source badge */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: sourceColor(light.source), letterSpacing: '0.06em', flexShrink: 0, opacity: 0.7 }}>
                      {light.source}
                    </span>
                    {/* Unreachable */}
                    {!light.reachable && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--neon-pink)', flexShrink: 0 }}>offline</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Govee / Kasa placeholder */}
      <div className="card" style={{ borderColor: 'var(--border-subtle)', opacity: 0.6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', letterSpacing: '0.08em', marginBottom: '6px' }}>
          govee &amp; tp-link kasa — not yet connected
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', lineHeight: 1.6 }}>
          Govee: requires GOVEE_API_KEY (Govee app → Profile → About → Apply for API key)
          <br />
          Kasa: best handled via the <code>tplink-smarthome-api</code> npm package (local network)
        </div>
      </div>
    </div>
  )
}

// ─── Network card ─────────────────────────────────────────────────────────────

function NetworkCard() {
  const [status, setStatus] = useState<Status<NetworkData>>({ state: 'loading' })
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const check = useCallback(() => {
    setStatus({ state: 'loading' })
    fetch('/api/home/network')
      .then(r => r.json())
      .then(data => {
        setStatus({ state: 'ok', data })
        setLastChecked(new Date())
      })
      .catch(() => setStatus({ state: 'error', msg: 'check failed' }))
  }, [])

  useEffect(() => { check() }, [check])

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          network
        </span>
        <button
          onClick={check}
          style={{
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-mid)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px 10px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
          }}
        >
          recheck
        </button>
      </div>

      {status.state === 'loading' ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
          pinging…
        </span>
      ) : status.state === 'error' ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>check failed</span>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: status.data.online ? 'var(--neon-green)' : 'var(--neon-pink)',
              boxShadow: status.data.online ? '0 0 8px var(--neon-green)99' : '0 0 8px var(--neon-pink)99',
              display: 'inline-block',
              animation: 'neon-pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: status.data.online ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
              {status.data.online ? 'online' : 'offline'}
            </span>
          </div>

          {status.data.online && status.data.latencyMs != null && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: latencyColor(status.data.latencyMs), fontWeight: 600 }}>
                {status.data.latencyMs}ms
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                to 1.1.1.1
              </span>
            </div>
          )}
        </>
      )}

      {lastChecked && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', marginTop: '4px' }}>
          checked {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {/* Nest WiFi note */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '0.5px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', lineHeight: 1.6 }}>
          Google Nest WiFi does not expose a public API — connected device counts and per-device stats
          are only available through the Google Home app.
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const now = new Date()

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            home.control
          </h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            spider hill — haddam, ct
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-ghost)' }}>
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Top row: thermostat + network */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '28px', alignItems: 'start' }}>
        <div>
          <SectionLabel>thermostat</SectionLabel>
          <ThermostatCard />
        </div>
        <div>
          <SectionLabel>connectivity</SectionLabel>
          <NetworkCard />
        </div>
      </div>

      {/* Lights */}
      <div>
        <SectionLabel>lights</SectionLabel>
        <LightsCard />
      </div>
    </div>
  )
}
