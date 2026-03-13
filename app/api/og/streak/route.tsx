// GET /api/og/streak?day=14&name=Vignesh
// Generates a 1200×630 OG image for Identity Sprint streak share cards.
// Uses Vercel OG (ImageResponse from 'next/og').
//
// Design: minimal, premium, badge/achievement feel
// - Dark background with deep indigo gradient
// - Large day number centered
// - Progress bar strip at bottom
// - Identity Sprint wordmark top

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const dayParam = searchParams.get('day')
  const name = searchParams.get('name')

  const day = dayParam ? parseInt(dayParam, 10) : 1
  const safeDay = isNaN(day) || day < 1 ? 1 : day

  const totalDays = 30
  const progressPct = Math.min(100, Math.round((safeDay / totalDays) * 100))
  const progressWidth = Math.round((progressPct / 100) * 1080) // inner bar (1200 - 2×60 padding)

  const displayName = name ? ` · ${name}` : ''
  const dayLabel = `Day ${safeDay}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #111827 50%, #0f0f0f 100%)',
          position: 'relative',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow behind center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #6366f1, #818cf8, #6366f1, transparent)',
            display: 'flex',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            position: 'absolute',
            top: '44px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#6b7280',
            }}
          >
            Identity Sprint
          </span>
        </div>

        {/* Center content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
          }}
        >
          {/* Day label */}
          <span
            style={{
              fontSize: '96px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: '1',
              letterSpacing: '-0.02em',
            }}
          >
            {dayLabel}
          </span>

          {/* Sub label */}
          <span
            style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#6b7280',
              marginTop: '16px',
              letterSpacing: '0.04em',
            }}
          >
            {`Identity Sprint · 30-Day Program${displayName}`}
          </span>
        </div>

        {/* Bottom progress strip */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '60px',
            right: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Progress label */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: '#4b5563', letterSpacing: '0.08em', fontWeight: 600 }}>
              PROGRESS
            </span>
            <span style={{ fontSize: '12px', color: '#6366f1', letterSpacing: '0.05em', fontWeight: 700 }}>
              {`${safeDay} / ${totalDays} days`}
            </span>
          </div>

          {/* Progress track */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(99,102,241,0.15)',
              borderRadius: '2px',
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressWidth}px`,
                height: '4px',
                background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #6366f1, #818cf8, #6366f1, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
