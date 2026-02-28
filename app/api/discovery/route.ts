import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error } = await supabaseAdmin
      .from('discovery')
      .insert([{
        email: body.email,
        name: body.name,
        q1_need: body.q1,
        q2_blocker: body.q2,
        q3_motivator: body.q3,
        q4_energiser: body.q4,
        q5_success: body.q5,
        q6_failure: body.q6,
        primary_craving: body.primary_craving,
        secondary_craving: body.secondary_craving,
        primary_failure: body.primary_failure,
        submitted_at: new Date().toISOString(),
      }])
    if (error) console.error('Discovery insert error:', error)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Discovery route error:', error)
    return NextResponse.json({ success: false })
  }
}
