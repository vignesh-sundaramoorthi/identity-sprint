// GET /api/og/cohort2
// Generates a 1200×630 OG image for the /cohort2 landing page.
// Used as og:image for LinkedIn/WhatsApp link previews.
//
// Design: dark premium feel matching IS brand
// - Deep background
// - Program label + headline
// - IS wordmark

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1035 50%, #0f0f1a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Label */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#7c3aed',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '28px',
            marginTop: '0px',
          }}
        >
          Cohort 2 — Now Forming
        </p>

        {/* Headline */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            margin: '0 0 28px 0',
            maxWidth: '900px',
          }}
        >
          Who are you becoming?
        </h1>

        {/* Subline */}
        <p
          style={{
            fontSize: '26px',
            fontWeight: 400,
            color: '#a78bfa',
            textAlign: 'center',
            margin: '0 0 48px 0',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Not a subscription. Not a streak. A permanent shift in who you are.
        </p>

        {/* CTA hint */}
        <div
          style={{
            background: 'rgba(124,58,237,0.2)',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: '100px',
            padding: '14px 36px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#c4b5fd' }}>
            Apply → identity-sprint.vercel.app
          </span>
        </div>

        {/* Wordmark */}
        <p
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '60px',
            fontSize: '16px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0',
          }}
        >
          Identity Sprint
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
