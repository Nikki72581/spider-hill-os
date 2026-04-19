'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Light } from '@/app/api/home/lights/route'

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

// ─── Google Home card ─────────────────────────────────────────────────────────

const GOOGLE_HOME_URL = 'https://home.google.com/home/1-4bfc5f340c621c2a5bbb4d96147620f98d06c67047fe2dc72f590e014c100834/devices'

function GoogleHomeCard() {
  const [blocked, setBlocked] = useState(false)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '600px', position: 'relative' }}>
      {blocked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-pink)' }}>
            google home blocked embedding
          </span>
          <a
            href={GOOGLE_HOME_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--neon-cyan)', textDecoration: 'none', letterSpacing: '0.06em' }}
          >
            open in new tab →
          </a>
        </div>
      ) : (
        <iframe
          src={GOOGLE_HOME_URL}
          style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
          onError={() => setBlocked(true)}
          title="Google Home"
        />
      )}
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

      {/* Google Home */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>google home</SectionLabel>
        <GoogleHomeCard />
      </div>

      {/* Bottom row: network + lights */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>
        <div>
          <SectionLabel>connectivity</SectionLabel>
          <NetworkCard />
        </div>
        <div>
          <SectionLabel>lights</SectionLabel>
          <LightsCard />
        </div>
      </div>
    </div>
  )
}
