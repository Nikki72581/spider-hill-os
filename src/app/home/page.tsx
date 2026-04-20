'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Light } from '@/app/api/home/lights/route'
import type { HAData } from '@/app/api/home/ha/route'

// ─── Types ────────────────────────────────────────────────────────────────────

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

function latencyColor(ms: number) {
  if (ms < 80)  return 'var(--neon-green)'
  if (ms < 200) return 'var(--neon-amber)'
  return 'var(--neon-pink)'
}

function sourceColor(_source: 'hue') {
  return 'var(--neon-amber)'
}

function hvacColor(action: string | null) {
  if (action === 'heating') return 'var(--neon-amber)'
  if (action === 'cooling') return 'var(--neon-cyan)'
  if (action === 'idle') return 'var(--neon-green)'
  return 'var(--text-muted)'
}

function sensorIcon(device_class: string | null) {
  switch (device_class) {
    case 'temperature': return '°'
    case 'humidity': return '%'
    case 'battery': return '⌁'
    case 'power': return 'W'
    case 'energy': return 'kWh'
    case 'co2': return 'CO₂'
    case 'pm25': return 'PM2.5'
    case 'pm10': return 'PM10'
    case 'illuminance': return 'lx'
    default: return '·'
  }
}

function binaryIcon(device_class: string | null, on: boolean) {
  switch (device_class) {
    case 'door': return on ? 'open' : 'closed'
    case 'window': return on ? 'open' : 'closed'
    case 'motion': return on ? 'detected' : 'clear'
    case 'smoke': return on ? 'detected' : 'clear'
    case 'moisture': return on ? 'wet' : 'dry'
    case 'lock': return on ? 'unlocked' : 'locked'
    case 'presence': return on ? 'home' : 'away'
    case 'opening': return on ? 'open' : 'closed'
    default: return on ? 'on' : 'off'
  }
}

function binaryStateColor(device_class: string | null, on: boolean) {
  if (device_class === 'smoke' || device_class === 'moisture') return on ? 'var(--neon-pink)' : 'var(--neon-green)'
  if (device_class === 'motion' || device_class === 'presence') return on ? 'var(--neon-cyan)' : 'var(--text-muted)'
  if (device_class === 'door' || device_class === 'window' || device_class === 'opening') return on ? 'var(--neon-amber)' : 'var(--text-muted)'
  return on ? 'var(--neon-green)' : 'var(--text-muted)'
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

// ─── Home Assistant card ──────────────────────────────────────────────────────

async function callHAService(domain: string, service: string, entity_id: string, extra?: Record<string, unknown>) {
  await fetch('/api/home/ha/service', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, service, entity_id, service_data: extra }),
  })
}

function HALightsSection({ lights, onToggle }: {
  lights: HAData['lights']
  onToggle: (entity_id: string, on: boolean) => void
}) {
  if (lights.length === 0) return null
  const onCount = lights.filter(l => l.on && !l.unavailable).length

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          lights
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: onCount > 0 ? 'var(--neon-green)' : 'var(--text-muted)' }}>
          {onCount}/{lights.length} on
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {lights.map(light => (
          <div key={light.entity_id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Toggle button */}
            <button
              onClick={() => !light.unavailable && onToggle(light.entity_id, light.on)}
              disabled={light.unavailable}
              style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0, padding: 0,
                background: light.on ? 'var(--neon-green)' : 'var(--bg-overlay)',
                border: light.on ? 'none' : '0.5px solid var(--border-mid)',
                boxShadow: light.on ? '0 0 6px var(--neon-green)88' : 'none',
                cursor: light.unavailable ? 'not-allowed' : 'pointer',
                opacity: light.unavailable ? 0.4 : 1,
                transition: 'background 0.15s, box-shadow 0.15s',
              }}
              title={light.unavailable ? 'unavailable' : light.on ? 'turn off' : 'turn on'}
            />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '12px',
              color: light.on ? 'var(--text-primary)' : 'var(--text-muted)',
              flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {light.name}
            </span>
            {light.on && light.brightness > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${light.brightness}%`, background: 'var(--neon-green)', borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', width: '28px', textAlign: 'right' }}>
                  {light.brightness}%
                </span>
              </div>
            )}
            {light.unavailable && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--neon-pink)', flexShrink: 0 }}>offline</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HAClimateSection({ climate }: { climate: HAData['climate'] }) {
  if (climate.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {climate.map(c => (
        <div key={c.entity_id} className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {c.name}
            </span>
            {c.hvac_action && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: hvacColor(c.hvac_action), letterSpacing: '0.04em' }}>
                {c.hvac_action}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
            {c.current_temp != null && (
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: hvacColor(c.hvac_action) }}>
                  {c.current_temp}°
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', marginLeft: '4px' }}>now</span>
              </div>
            )}
            {c.target_temp != null && (
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--text-secondary)' }}>
                  {c.target_temp}°
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', marginLeft: '4px' }}>set</span>
              </div>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', marginLeft: 'auto', letterSpacing: '0.04em' }}>
              {c.mode}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function HASensorsSection({ sensors, binary_sensors }: { sensors: HAData['sensors']; binary_sensors: HAData['binary_sensors'] }) {
  if (sensors.length === 0 && binary_sensors.length === 0) return null
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '14px' }}>
        sensors
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
        {sensors.map(s => (
          <div key={s.entity_id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-ghost)', letterSpacing: '0.06em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600, color: 'var(--neon-cyan)' }}>
              {s.state}{s.unit && <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>{s.unit}</span>}
            </span>
          </div>
        ))}
        {binary_sensors.map(s => (
          <div key={s.entity_id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-ghost)', letterSpacing: '0.06em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: binaryStateColor(s.device_class, s.on), flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: binaryStateColor(s.device_class, s.on) }}>
                {binaryIcon(s.device_class, s.on)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeAssistantCard() {
  const [status, setStatus] = useState<Status<HAData>>({ state: 'loading' })
  // optimistic state for light toggles
  const [lightOverrides, setLightOverrides] = useState<Record<string, boolean>>({})

  const load = useCallback(() => {
    fetch('/api/home/ha')
      .then(r => r.json())
      .then((data: HAData) => {
        setStatus({ state: 'ok', data })
        setLightOverrides({})
      })
      .catch(() => setStatus({ state: 'error', msg: 'fetch failed' }))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleToggle(entity_id: string, currentOn: boolean) {
    const nextOn = !currentOn
    setLightOverrides(prev => ({ ...prev, [entity_id]: nextOn }))
    try {
      await callHAService('light', nextOn ? 'turn_on' : 'turn_off', entity_id)
      // refresh after short delay so HA state catches up
      setTimeout(load, 1200)
    } catch {
      setLightOverrides(prev => ({ ...prev, [entity_id]: currentOn }))
    }
  }

  if (status.state === 'loading') return (
    <div className="card" style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', animation: 'neon-pulse 1.5s ease-in-out infinite' }}>
        connecting to home assistant…
      </span>
    </div>
  )

  if (status.state === 'error') return (
    <div className="card">
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>home assistant unavailable</span>
    </div>
  )

  const { configured, reachable, lights, climate, sensors, binary_sensors } = status.data

  if (!configured) return (
    <SetupCard
      title="home assistant"
      steps={[
        'In Home Assistant: Profile → Long-Lived Access Tokens → Create Token',
        'Add to .env.local: HOME_ASSISTANT_URL=http://<ha-ip>:8123',
        'Add to .env.local: HOME_ASSISTANT_TOKEN=<your-token>',
        'Restart the dev server — HA is only accessible on LAN until you expose it remotely',
      ]}
    />
  )

  if (!reachable) return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-pink)', display: 'inline-block' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>
          home assistant unreachable
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', lineHeight: 1.6 }}>
        Home Assistant is only available on the local network. Connect to Spider Hill WiFi or expose HA remotely to use home control.
      </div>
    </div>
  )

  const resolvedLights = lights.map(l => ({
    ...l,
    on: lightOverrides[l.entity_id] !== undefined ? lightOverrides[l.entity_id] : l.on,
  }))

  const hasContent = lights.length > 0 || climate.length > 0 || sensors.length > 0 || binary_sensors.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Status header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)88', display: 'inline-block', animation: 'neon-pulse 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--neon-green)', letterSpacing: '0.06em' }}>
          connected
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-ghost)', marginLeft: 'auto', letterSpacing: '0.04em' }}>
          lan only
        </span>
        <button
          onClick={load}
          style={{
            background: 'var(--bg-elevated)', border: '0.5px solid var(--border-mid)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
            fontSize: '10px', letterSpacing: '0.06em', cursor: 'pointer',
          }}
        >
          refresh
        </button>
      </div>

      {!hasContent && (
        <div className="card">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
            no entities found — check HA entity configuration
          </span>
        </div>
      )}

      {climate.length > 0 && <HAClimateSection climate={climate} />}
      {resolvedLights.length > 0 && <HALightsSection lights={resolvedLights} onToggle={handleToggle} />}
      {(sensors.length > 0 || binary_sensors.length > 0) && (
        <HASensorsSection sensors={sensors} binary_sensors={binary_sensors} />
      )}
    </div>
  )
}

// ─── Google Home card ─────────────────────────────────────────────────────────

const GOOGLE_HOME_URL = 'https://home.google.com/home/1-4bfc5f340c621c2a5bbb4d96147620f98d06c67047fe2dc72f590e014c100834/devices'

function GoogleHomeCard() {
  return (
    <a
      href={GOOGLE_HOME_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--neon-cyan)44')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" fill="var(--text-ghost)" />
              <path d="M12 7v5l3 3" stroke="var(--neon-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '0.02em', marginBottom: '3px' }}>
              google home
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              spider hill — all devices
            </div>
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--neon-cyan)', letterSpacing: '0.06em' }}>
          open →
        </span>
      </div>
    </a>
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

      {/* Google Home */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>google home</SectionLabel>
        <GoogleHomeCard />
      </div>

      {/* Home Assistant */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>home assistant</SectionLabel>
        <HomeAssistantCard />
      </div>

      {/* Bottom row: network + lights */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>
        <div>
          <SectionLabel>connectivity</SectionLabel>
          <NetworkCard />
        </div>
        <div>
          <SectionLabel>philips hue</SectionLabel>
          <LightsCard />
        </div>
      </div>
    </div>
  )
}
