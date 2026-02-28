import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/sprint/[id]/checkin
// Returns the application's identity_goal + any existing check-ins
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const applicationId = parseInt(params.id, 10)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  // Fetch the application (identity_goal)
  const { data: application, error: appError } = await supabaseAdmin
    .from('applications')
    .select('id, name, identity_goal')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // Fetch existing check-ins for this application
  const { data: checkins } = await supabaseAdmin
    .from('checkins')
    .select('*')
    .eq('application_id', applicationId)
    .order('week_number', { ascending: true })

  return NextResponse.json({
    application,
    checkins: checkins ?? [],
  })
}

// POST /api/sprint/[id]/checkin
// Upsert a weekly check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const applicationId = parseInt(params.id, 10)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const body = await request.json()
  const { week_number, identity_rating, reflection_text } = body

  if (
    typeof week_number !== 'number' ||
    typeof identity_rating !== 'number' ||
    identity_rating < 1 ||
    identity_rating > 5
  ) {
    return NextResponse.json({ error: 'Invalid check-in data' }, { status: 400 })
  }

  // Upsert: one check-in per application per week
  const { data, error } = await supabase
    .from('checkins')
    .upsert(
      {
        application_id: applicationId,
        week_number,
        identity_rating,
        reflection_text: reflection_text || null,
      },
      { onConflict: 'application_id,week_number' }
    )
    .select()
    .single()

  if (error) {
    console.error('Checkin upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, checkin: data })
}
