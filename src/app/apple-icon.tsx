import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  const cx = 90
  const cy = 82
  const radii = [20, 38, 56, 74]
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#020802',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Spider web */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Radial spokes */}
          {angles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(rad) * 82}
                y2={cy + Math.sin(rad) * 82}
                stroke="#082e14"
                strokeWidth="0.8"
              />
            )
          })}
          {/* Concentric rings */}
          {radii.map((r, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} stroke="#082e14" strokeWidth="0.8" fill="none" />
          ))}

          {/* Corner brackets */}
          <polyline points="8,24 8,8 24,8" stroke="#0CFF70" strokeWidth="2" fill="none" />
          <polyline points="156,8 172,8 172,24" stroke="#0CFF70" strokeWidth="2" fill="none" />
          <polyline points="8,156 8,172 24,172" stroke="#0CFF70" strokeWidth="2" fill="none" />
          <polyline points="172,156 172,172 156,172" stroke="#0CFF70" strokeWidth="2" fill="none" />

          {/* Dashed orbit ring around text */}
          <circle cx={cx} cy={cy} r="46" stroke="#0CFF70" strokeWidth="0.6" fill="none" opacity="0.25" strokeDasharray="3,7" />

          {/* Small dots at spoke ends */}
          {angles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180
            return (
              <circle
                key={i}
                cx={cx + Math.cos(rad) * 74}
                cy={cy + Math.sin(rad) * 74}
                r="1.5"
                fill="#0CFF70"
                opacity="0.4"
              />
            )
          })}
        </svg>

        {/* Status bar top */}
        <div
          style={{
            position: 'absolute',
            top: 13,
            left: 28,
            right: 28,
            display: 'flex',
            justifyContent: 'center',
            color: '#0a5528',
            fontSize: 8,
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
          }}
        >
          PIP-OS ACTIVE
        </div>

        {/* SH monogram */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            marginTop: '-4px',
          }}
        >
          <div
            style={{
              color: '#0CFF70',
              fontSize: 80,
              fontFamily: 'monospace',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-6px',
              textShadow: '0 0 10px #0CFF70, 0 0 22px #0CFF70, 0 0 44px #0CFF7055',
            }}
          >
            SH
          </div>
          <div
            style={{
              color: '#FFB000',
              fontSize: 10,
              fontFamily: 'monospace',
              letterSpacing: '0.28em',
              marginTop: '1px',
              textShadow: '0 0 6px #FFB000',
            }}
          >
            UNIT-OS
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 13,
            left: 28,
            right: 28,
            height: '1px',
            background: '#0CFF7025',
          }}
        />
      </div>
    ),
    { width: 180, height: 180 }
  )
}
