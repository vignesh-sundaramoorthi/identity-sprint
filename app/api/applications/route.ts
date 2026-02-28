import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('applications')
      .insert([{
        name: body.name,
        email: body.email,
        whatsapp: body.whatsapp || null,
        identity_goal: body.identity_goal,
        tried_before: body.tried_before,
        why_now: body.why_now,
        commitment: body.commitment,
        status: 'new',
      }])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.[0]?.id })
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Supabase read error:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error reading applications:', error)
    return NextResponse.json([])
  }
}
