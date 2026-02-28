import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET /api/tracker/[token]/onboarding
// Returns the challenge's identity_goal (from linked application) + existing declaration if any
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // 1. Get challenge by token
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select('id, user_email, user_name, status')
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // 2. Get identity_goal from application (match by email)
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('identity_goal, name')
    .eq('email', challenge.user_email)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 3. Get existing declaration if any
  const { data: declaration } = await supabase
    .from('identity_declarations')
    .select('id, declaration, created_at')
    .eq('challenge_id', challenge.id)
    .maybeSingle()

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      user_name: challenge.user_name ?? application?.name ?? 'there',
      status: challenge.status,
    },
    identity_goal: application?.identity_goal ?? null,
    declaration: declaration ?? null,
  })
}

// POST /api/tracker/[token]/onboarding
// Save the identity declaration ("I am becoming...")
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await req.json()

  const { declaration } = body as { declaration?: string }

  if (!declaration || declaration.trim().length < 5) {
    return NextResponse.json({ error: 'Declaration is required' }, { status: 400 })
  }

  // Get challenge by token
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select('id, user_email')
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Get identity_goal from application
  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('identity_goal')
    .eq('email', challenge.user_email)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const identity_goal = application?.identity_goal ?? ''

  // Upsert declaration (one per challenge)
  const { data: saved, error: saveError } = await supabase
    .from('identity_declarations')
    .upsert(
      {
        challenge_id: challenge.id,
        identity_goal,
        declaration: declaration.trim(),
      },
      { onConflict: 'challenge_id' }
    )
    .select()
    .single()

  if (saveError) {
    console.error('Error saving declaration:', saveError)
    return NextResponse.json({ error: 'Failed to save declaration' }, { status: 500 })
  }

  return NextResponse.json({ success: true, declaration: saved })
}
