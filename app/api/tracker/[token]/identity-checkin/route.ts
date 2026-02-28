import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/tracker/[token]/identity-checkin
// Returns this week's check-in (if any) + identity_goal + declaration
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Get challenge
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select('id, user_email, user_name, start_date')
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Calculate current week number
  const startDate = new Date(challenge.start_date)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.max(1, Math.ceil((daysSinceStart + 1) / 7))

  // Get identity_goal from application
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('identity_goal')
    .eq('email', challenge.user_email)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get declaration
  const { data: declaration } = await supabase
    .from('identity_declarations')
    .select('declaration')
    .eq('challenge_id', challenge.id)
    .maybeSingle()

  // Get this week's check-in
  const { data: thisWeekCheckin } = await supabase
    .from('identity_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .eq('week_number', weekNumber)
    .maybeSingle()

  // Get all past check-ins for context
  const { data: allCheckins } = await supabase
    .from('identity_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('week_number', { ascending: true })

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      user_name: challenge.user_name ?? 'there',
      start_date: challenge.start_date,
    },
    week_number: weekNumber,
    identity_goal: application?.identity_goal ?? null,
    declaration: declaration?.declaration ?? null,
    this_week_checkin: thisWeekCheckin ?? null,
    all_checkins: allCheckins ?? [],
  })
}

// POST /api/tracker/[token]/identity-checkin
// Save this week's identity check-in
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json()

  const {
    identity_rating,
    reflection,
    week_number,
  } = body as {
    identity_rating?: number
    reflection?: string
    week_number?: number
  }

  if (!identity_rating || identity_rating < 1 || identity_rating > 5) {
    return NextResponse.json({ error: 'identity_rating must be 1-5' }, { status: 400 })
  }

  // Get challenge
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select('id, start_date')
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Calculate week number if not provided
  const startDate = new Date(challenge.start_date)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const resolvedWeekNumber = week_number ?? Math.max(1, Math.ceil((daysSinceStart + 1) / 7))

  // Upsert check-in
  const { data: saved, error: saveError } = await supabase
    .from('identity_checkins')
    .upsert(
      {
        challenge_id: challenge.id,
        week_number: resolvedWeekNumber,
        identity_rating,
        reflection: reflection?.trim() ?? null,
      },
      { onConflict: 'challenge_id,week_number' }
    )
    .select()
    .single()

  if (saveError) {
    console.error('Error saving identity check-in:', saveError)
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 })
  }

  return NextResponse.json({ success: true, checkin: saved, week_number: resolvedWeekNumber })
}
