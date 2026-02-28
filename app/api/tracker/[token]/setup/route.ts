// POST /api/tracker/[token]/setup — update challenge with duration + habits
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  const body = await req.json()

  const { duration_days, habit_1_id, habit_2_id, habit_3_id, habit_4_id, habit_5_id } = body

  if (!duration_days || ![21, 30, 66, 100].includes(Number(duration_days))) {
    return NextResponse.json({ error: 'Invalid duration_days' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('challenges')
    .update({
      duration_days: Number(duration_days),
      habit_1_id: habit_1_id ?? null,
      habit_2_id: habit_2_id ?? null,
      habit_3_id: habit_3_id ?? null,
      habit_4_id: habit_4_id ?? null,
      habit_5_id: habit_5_id ?? null,
    })
    .eq('token', token)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, challenge: data })
}
