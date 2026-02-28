import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/sprint/[id]/onboarding
// Returns the application's identity_goal + any existing declaration
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const applicationId = parseInt(params.id, 10)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const { data: application, error } = await supabaseAdmin
    .from('applications')
    .select('id, name, identity_goal, identity_declaration')
    .eq('id', applicationId)
    .single()

  if (error || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  return NextResponse.json({ application })
}

// POST /api/sprint/[id]/onboarding
// Saves the user's identity declaration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const applicationId = parseInt(params.id, 10)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const body = await request.json()
  const { identity_declaration } = body

  if (!identity_declaration || typeof identity_declaration !== 'string' || identity_declaration.trim().length < 5) {
    return NextResponse.json({ error: 'Declaration too short' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ identity_declaration: identity_declaration.trim() })
    .eq('id', applicationId)
    .select('id, identity_declaration')
    .single()

  if (error) {
    console.error('Declaration save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, application: data })
}
