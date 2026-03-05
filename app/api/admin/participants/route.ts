import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

// GET /api/admin/participants
// Returns all sprint_participants joined with applications and checkins
export async function GET(_req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const { data: participants, error } = await supabaseAdmin
    .from('sprint_participants')
    .select(`
      id,
      application_id,
      cohort_id,
      enrolled_at,
      status,
      habit_recommendation,
      applications (
        id,
        name,
        email,
        whatsapp,
        submitted_at,
        status,
        identity_goal,
        tried_before,
        why_now,
        commitment,
        identity_declaration,
        outcome_type,
        stage_signal,
        pre_sprint_signal,
        week_3_badge,
        dm_identity_verbatim,
        outreach_door,
        outreach_deflection_type,
        relational_anchor_type,
        post_sprint_first_checkin_status,
        post_sprint_language_signal,
        sprint_completion_statement,
        sprint_completion_statement_type,
        moment_flag,
        moment_text
      )
    `)
    .order('enrolled_at', { ascending: false })

  if (error) {
    console.error('Participants fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch checkins for all participant application_ids
  const applicationIds = (participants || []).map((p) => p.application_id)

  let checkins: CheckinRow[] = []
  if (applicationIds.length > 0) {
    const { data: checkinData } = await supabaseAdmin
      .from('checkins')
      .select('*')
      .in('application_id', applicationIds)
      .order('week_number', { ascending: true })
    checkins = (checkinData || []) as CheckinRow[]
  }

  // Group checkins by application_id
  const checkinsByApp: Record<number, CheckinRow[]> = {}
  for (const c of checkins) {
    if (!checkinsByApp[c.application_id]) checkinsByApp[c.application_id] = []
    checkinsByApp[c.application_id].push(c)
  }

  return NextResponse.json({
    participants: participants || [],
    checkinsByApp,
  })
}

interface CheckinRow {
  id: number
  application_id: number
  week_number: number
  identity_rating: number
  reflection_text?: string
  field_9_recognition?: string
  field_9_verbatim?: string
  wall_triggered_at?: string
  wall_responded_at?: string
  created_at: string
}

// PATCH /api/admin/participants
// Update habit_recommendation, dm_identity_verbatim, pre_sprint_signal, stage_signal, or outcome_type
export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const body = await req.json()
  const { participant_id, application_id, ...fields } = body

  // Fields allowed to update on sprint_participants
  const participantFields: Record<string, unknown> = {}
  if ('habit_recommendation' in fields) participantFields.habit_recommendation = fields.habit_recommendation

  // Fields allowed to update on applications
  const applicationFields: Record<string, unknown> = {}
  if ('dm_identity_verbatim' in fields) applicationFields.dm_identity_verbatim = fields.dm_identity_verbatim
  if ('pre_sprint_signal' in fields) applicationFields.pre_sprint_signal = fields.pre_sprint_signal
  if ('stage_signal' in fields) applicationFields.stage_signal = fields.stage_signal
  if ('outcome_type' in fields) applicationFields.outcome_type = fields.outcome_type
  if ('outreach_door' in fields) applicationFields.outreach_door = fields.outreach_door
  if ('outreach_deflection_type' in fields) applicationFields.outreach_deflection_type = fields.outreach_deflection_type
  // BUG-017: coerce empty string → null for CHECK-constrained fields (Postgres rejects "" but accepts NULL)
  if ('relational_anchor_type' in fields) applicationFields.relational_anchor_type = fields.relational_anchor_type || null
  if ('post_sprint_first_checkin_status' in fields) applicationFields.post_sprint_first_checkin_status = fields.post_sprint_first_checkin_status || null
  if ('post_sprint_language_signal' in fields) applicationFields.post_sprint_language_signal = fields.post_sprint_language_signal || null
  if ('sprint_completion_statement' in fields) applicationFields.sprint_completion_statement = fields.sprint_completion_statement
  if ('sprint_completion_statement_type' in fields) applicationFields.sprint_completion_statement_type = fields.sprint_completion_statement_type || null
  if ('moment_flag' in fields) applicationFields.moment_flag = fields.moment_flag
  if ('moment_text' in fields) applicationFields.moment_text = fields.moment_text

  const errors: string[] = []

  if (Object.keys(participantFields).length > 0 && participant_id) {
    const { error } = await supabaseAdmin
      .from('sprint_participants')
      .update(participantFields)
      .eq('id', participant_id)
    if (error) errors.push(`participant update: ${error.message}`)
  }

  if (Object.keys(applicationFields).length > 0 && application_id) {
    const { error } = await supabaseAdmin
      .from('applications')
      .update(applicationFields)
      .eq('id', application_id)
    if (error) errors.push(`application update: ${error.message}`)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
