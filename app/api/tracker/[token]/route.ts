// GET /api/tracker/[token] — fetch challenge + today's check-in + identity profile + becoming_statement
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTodayDateStr } from '@/lib/tracker'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  // Fetch challenge with all habit details
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select(`
      *,
      habit_1:habits!challenges_habit_1_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_2:habits!challenges_habit_2_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_3:habits!challenges_habit_3_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_4:habits!challenges_habit_4_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_5:habits!challenges_habit_5_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji))
    `)
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Fetch today's check-in
  const today = getTodayDateStr()
  const { data: todayCheckin } = await supabaseAdmin
    .from('daily_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .eq('check_date', today)
    .single()

  // Fetch identity profile + becoming_statement via email join
  // Join path: challenges.user_email → applications.email → sprint_participants
  let identityProfile: {
    label: string
    qualities: string[]
    signal_tone: string
    generated_at: string
  } | null = null
  let identityProfileApproved = false
  let anchorStatement: string | null = null
  let snapshot: string | null = null
  let becomingStatement: string | null = null

  if (challenge.user_email) {
    // Look up application by email
    const { data: application } = await supabaseAdmin
      .from('applications')
      .select('id, identity_goal, identity_declaration')
      .eq('email', challenge.user_email)
      .maybeSingle()

    if (application) {
      // becoming_statement: prefer identity_declaration ("I am becoming..."), fall back to identity_goal
      becomingStatement = application.identity_declaration ?? application.identity_goal ?? null

      // Look up sprint_participant by application_id
      const { data: participant } = await supabaseAdmin
        .from('sprint_participants')
        .select(
          'identity_profile, identity_profile_approved, anchor_statement, snapshot'
        )
        .eq('application_id', application.id)
        .maybeSingle()

      if (participant) {
        identityProfile = participant.identity_profile ?? null
        identityProfileApproved = participant.identity_profile_approved ?? false
        anchorStatement = participant.anchor_statement ?? null
        snapshot = participant.snapshot ?? null
      }
    }
  }

  return NextResponse.json({
    challenge,
    todayCheckin: todayCheckin ?? null,
    // Identity profile fields (Phase 4 PR1)
    identityProfile,
    identityProfileApproved,
    anchorStatement,
    snapshot,
    // Streak share card (Phase 4 PR2)
    becomingStatement,
  })
}
