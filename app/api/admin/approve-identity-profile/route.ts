// POST /api/admin/approve-identity-profile
// Coach approves a generated identity profile draft, making it visible to the participant.
//
// CRITICAL RULES (Flux H173 — LOCKED):
// - identity_profile is PERMANENT once approved. No reset, no delete.
// - This route sets identity_profile_approved = true + records the timestamp.
// - Also stores the anchor_statement if provided (coach can edit before approving).
//
// After approval:
// - Participant dashboard switches from frosted pending card → revealed approved card
// - anchor_statement becomes visible ("Your anchor" Day-1 visible)

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const authError = requireAdminAuth()
  if (authError) return authError

  let body: { participant_id: string; anchor_statement?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { participant_id, anchor_statement } = body

  if (!participant_id || typeof participant_id !== 'string') {
    return NextResponse.json({ error: 'participant_id required' }, { status: 400 })
  }

  // Verify participant has a draft profile to approve
  const { data: participant, error: fetchError } = await supabaseAdmin
    .from('sprint_participants')
    .select('id, identity_profile, identity_profile_approved')
    .eq('id', participant_id)
    .single()

  if (fetchError || !participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
  }

  if (!participant.identity_profile) {
    return NextResponse.json(
      { error: 'No identity profile draft found. Generate one first.' },
      { status: 400 }
    )
  }

  if (participant.identity_profile_approved === true) {
    return NextResponse.json(
      {
        error: 'Identity profile already approved.',
        principle: 'identity_profile is permanent once approved',
      },
      { status: 409 }
    )
  }

  // Build update payload
  const updatePayload: {
    identity_profile_approved: boolean
    identity_profile_approved_at: string
    anchor_statement?: string
  } = {
    identity_profile_approved: true,
    identity_profile_approved_at: new Date().toISOString(),
  }

  if (anchor_statement && typeof anchor_statement === 'string' && anchor_statement.trim()) {
    updatePayload.anchor_statement = anchor_statement.trim()
  }

  const { error: updateError } = await supabaseAdmin
    .from('sprint_participants')
    .update(updatePayload)
    .eq('id', participant_id)

  if (updateError) {
    return NextResponse.json(
      { error: `Approval failed: ${updateError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    participant_id,
    approved_at: updatePayload.identity_profile_approved_at,
    anchor_statement: updatePayload.anchor_statement ?? null,
    message: 'Profile approved. Now visible to participant dashboard.',
  })
}
