// GET /api/admin/identity-profile-alerts
//
// Day 1 Identity Profile Alert — Phase 4 PR3 (Forge H188)
//
// Purpose: Detects participants whose sprint starts within ~20 hours AND whose
// Identity Profile has not yet been approved by the coach.
//
// Background:
// The participant dashboard shows "Your coach is preparing your identity profile..."
// (frosted pending state). This is a PROMISE — the profile will be visible Day 1.
// If Vignesh hasn't approved before Day 1, the participant sees the promise AND
// the void simultaneously. That destroys the "crafted for you" perception.
// (Flux H187, RICE ~135: Impact=9, Confidence=9)
//
// How it works:
// Sprint "Day 1" = enrolled_at + 24 hours (first full day after enrollment)
// Alert window: enrolled_at is between (NOW() - 24hrs) and (NOW() - 4hrs)
//   → Sprint Day 1 is imminent (< 20hrs away) but not yet started
//   → Identity profile NOT yet approved
//
// Can be called:
// 1. Manually (Vignesh visits admin panel or clicks "Check alerts")
// 2. Via Vercel Cron Job (add to vercel.json — see comments below)
// 3. Via admin participants page banner (planned for Phase 4 PR3 UI)
//
// Vercel cron setup (add to vercel.json):
// {
//   "crons": [{
//     "path": "/api/admin/identity-profile-alerts",
//     "schedule": "0 * * * *"  ← runs every hour
//   }]
// }
// Note: Vercel cron calls don't pass cookies. This route accepts CRON_SECRET
// header as an alternative auth method for cron calls.
//
// Response:
// {
//   alertCount: number,             // participants in the alert window
//   alerts: AlertParticipant[],     // list of at-risk participants
//   checkedAt: string               // ISO timestamp of this check
// }

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'

// Alert window: sprint starts within 20 hours (enrolled_at is 4-24 hours ago)
const ALERT_WINDOW_MIN_HOURS = 4   // don't alert if enrolled < 4hrs ago (too early)
const ALERT_WINDOW_MAX_HOURS = 24  // alert if enrolled up to 24hrs ago (sprint Day 1 today)

interface AlertParticipant {
  participant_id: string
  name: string
  email: string
  whatsapp: string | null
  enrolled_at: string
  hours_since_enrolled: number
  hours_until_day1: number
  identity_goal: string | null
  admin_url: string
}

export async function GET(req: NextRequest) {
  // Auth: accept cookie-based admin auth OR cron secret header
  const cronSecret = req.headers.get('x-cron-secret')
  const expectedCronSecret = process.env.CRON_SECRET

  const isCronCall = expectedCronSecret && cronSecret === expectedCronSecret

  if (!isCronCall) {
    // Fall back to standard admin cookie auth
    const authError = requireAdminAuth()
    if (authError) return authError
  }

  const now = new Date()

  // Calculate enrolled_at window:
  // enrolled_at must be between (now - 24hrs) and (now - 4hrs)
  // This means Day 1 arrives in 0–20 hours from now
  const windowStart = new Date(now.getTime() - ALERT_WINDOW_MAX_HOURS * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() - ALERT_WINDOW_MIN_HOURS * 60 * 60 * 1000)

  // Query sprint_participants in alert window with unapproved profiles
  // Note: identity_profile_approved column added in phase4-identity-profile.sql migration
  // If migration not yet run, this returns 500 with a clear error message.
  const { data: participants, error } = await supabaseAdmin
    .from('sprint_participants')
    .select(`
      id,
      enrolled_at,
      identity_profile_approved,
      applications (
        name,
        email,
        whatsapp,
        identity_goal
      )
    `)
    .gte('enrolled_at', windowStart.toISOString())
    .lte('enrolled_at', windowEnd.toISOString())
    .eq('identity_profile_approved', false)
    .eq('status', 'active')

  if (error) {
    console.error('Identity profile alerts query error:', error)
    // Helpful error if migration not run yet
    if (error.message?.includes('identity_profile_approved')) {
      return NextResponse.json(
        {
          error: 'Column identity_profile_approved not found. Run supabase/phase4-identity-profile.sql migration first.',
          hint: 'Run the SQL migration in Supabase dashboard, then retry.'
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const alerts: AlertParticipant[] = (participants || []).map((p) => {
    const app = Array.isArray(p.applications) ? p.applications[0] : p.applications
    const enrolledAt = new Date(p.enrolled_at)
    const hoursSinceEnrolled = (now.getTime() - enrolledAt.getTime()) / (1000 * 60 * 60)
    const hoursUntilDay1 = Math.max(0, 24 - hoursSinceEnrolled)

    return {
      participant_id: p.id,
      name: app?.name ?? 'Unknown',
      email: app?.email ?? '',
      whatsapp: app?.whatsapp ?? null,
      enrolled_at: p.enrolled_at,
      hours_since_enrolled: Math.round(hoursSinceEnrolled * 10) / 10,
      hours_until_day1: Math.round(hoursUntilDay1 * 10) / 10,
      identity_goal: app?.identity_goal ?? null,
      // Direct link to admin participant detail (Vignesh can click this to act)
      admin_url: `https://identity-sprint.vercel.app/admin/participants#${p.id}`
    }
  })

  // Sort by urgency — most imminent Day 1 first
  alerts.sort((a, b) => a.hours_until_day1 - b.hours_until_day1)

  return NextResponse.json({
    alertCount: alerts.length,
    alerts,
    checkedAt: now.toISOString(),
    message:
      alerts.length === 0
        ? 'All active participants have approved identity profiles or are not yet in the alert window.'
        : `⚠️ ${alerts.length} participant(s) have sprint Day 1 approaching without an approved Identity Profile.`
  })
}
