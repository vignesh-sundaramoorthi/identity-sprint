// POST /api/admin/generate-identity-profile
// Generates an AI identity profile draft for a sprint participant.
//
// CRITICAL RULES (Flux H173 — LOCKED):
// 1. signal_tone MUST be validated as 'H1' | 'H2' | 'none' BEFORE the AI call fires.
//    Wrong signal_tone = wrong product, not just wrong response. Gate is MANDATORY.
// 2. identity_profile is PERMANENT once stored. This route only creates a draft
//    (identity_profile_approved = false). Never deletes or overwrites an approved profile.
//
// Gates: Vignesh must run phase4-identity-profile.sql + confirm AI provider (Anthropic)
// before this route is live.

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateIdentityProfile, SignalTone } from '@/lib/ai/generateIdentityProfile'

const VALID_SIGNAL_TONES: SignalTone[] = ['H1', 'H2', 'none']

export async function POST(req: Request) {
  const authError = requireAdminAuth()
  if (authError) return authError

  let body: { participant_id: string; signal_tone: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { participant_id, signal_tone } = body

  if (!participant_id || typeof participant_id !== 'string') {
    return NextResponse.json({ error: 'participant_id required' }, { status: 400 })
  }

  // MANDATORY: Validate signal_tone before ANY AI call fires (Flux H173 — LOCKED)
  if (!VALID_SIGNAL_TONES.includes(signal_tone as SignalTone)) {
    return NextResponse.json(
      {
        error: 'Invalid signal_tone. Must be "H1", "H2", or "none".',
        received: signal_tone,
      },
      { status: 400 }
    )
  }

  // Fetch participant + their application data
  const { data: participant, error: fetchError } = await supabaseAdmin
    .from('sprint_participants')
    .select(`
      id,
      identity_profile,
      identity_profile_approved,
      applications (
        name,
        identity_goal,
        primary_craving,
        secondary_craving,
        primary_failure,
        outcome_type
      )
    `)
    .eq('id', participant_id)
    .single()

  if (fetchError || !participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
  }

  // PERMANENT PROTECTION: Never overwrite an approved identity profile (Flux H173 — LOCKED)
  if (participant.identity_profile_approved === true) {
    return NextResponse.json(
      {
        error: 'This participant already has an approved identity profile. It cannot be regenerated.',
        principle: 'identity_profile is permanent once approved',
      },
      { status: 409 }
    )
  }

  const app = Array.isArray(participant.applications)
    ? participant.applications[0]
    : participant.applications

  if (!app) {
    return NextResponse.json({ error: 'Application data not found for participant' }, { status: 404 })
  }

  // Infer domain from identity_goal (simple keyword matching — existing pattern)
  const domainKeywords: Record<string, string[]> = {
    health: ['health', 'fitness', 'weight', 'sleep', 'nutrition', 'exercise', 'body'],
    career: ['career', 'work', 'job', 'business', 'professional', 'productivity'],
    creativity: ['creative', 'art', 'writing', 'music', 'design', 'create'],
    relationships: ['relationship', 'family', 'partner', 'marriage', 'connection', 'social'],
    learning: ['learning', 'study', 'skill', 'knowledge', 'reading', 'education'],
    wellbeing: ['mindfulness', 'meditation', 'stress', 'anxiety', 'mental', 'wellbeing'],
    financial: ['money', 'financial', 'wealth', 'saving', 'budget', 'investment'],
  }

  const goalLower = (app.identity_goal ?? '').toLowerCase()
  let domain: string | null = null
  for (const [d, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some((kw) => goalLower.includes(kw))) {
      domain = d
      break
    }
  }

  try {
    const profile = await generateIdentityProfile({
      name: app.name,
      identity_goal: app.identity_goal,
      primary_craving: app.primary_craving,
      secondary_craving: app.secondary_craving,
      primary_failure: app.primary_failure,
      // pre_sprint_signal intentionally NOT passed — signal_tone is the admin-validated value.
      // Passing raw pre_sprint_signal risked stale DB data silently influencing generation.
      // MEDIUM finding (Probe H174) — resolved by dropping the unused field.
      signal_tone: signal_tone as SignalTone,
      domain,
    })

    // Store draft — identity_profile_approved stays false until coach explicitly approves
    const { error: updateError } = await supabaseAdmin
      .from('sprint_participants')
      .update({
        identity_profile: profile,
        identity_profile_approved: false,
      })
      .eq('id', participant_id)

    if (updateError) {
      throw new Error(`DB update failed: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      profile,
      participant_id,
      status: 'draft',
      message: 'Profile generated. Review and approve to reveal to participant.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Generation failed: ${message}` }, { status: 500 })
  }
}
