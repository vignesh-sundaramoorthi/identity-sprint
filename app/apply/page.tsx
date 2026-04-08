// Server component — reads Vercel geo header and passes isIndia as a prop.
// Fix for BUG-INDIA-TRUST-ARCH-1: x-vercel-ip-country is only available server-side.
// The original page.tsx was 'use client', so the geo header was never accessible.
// Architecture: server wrapper (this file) → client form (ApplyClient.tsx)
import { headers } from 'next/headers'
import ApplyClient from './ApplyClient'

export default function ApplyPage() {
  const country = headers().get('x-vercel-ip-country')
  const isIndia = country === 'IN'
  return <ApplyClient isIndia={isIndia} />
}
