// GET /api/tracker/[token] — fetch challenge + today's check-in
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTodayDateStr } from '@/lib/tracker'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  // Fetch challenge with all habit details
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select(`
      *,
      habit_1:habits!challenges_habit_1_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_2:habits!challenges_habit_2_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_3:habits!challenges_habit_3_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_4:habits!challenges_habit_4_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji)),
      habit_5:habits!challenges_habit_5_id_fkey(id, name, description, difficulty, simpler_version, domain_id, habit_domains(name, emoji))
    `)
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Fetch today's check-in
  const today = getTodayDateStr()
  const { data: todayCheckin } = await supabaseAdmin
    .from('daily_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .eq('check_date', today)
    .single()

  return NextResponse.json({ challenge, todayCheckin: todayCheckin ?? null })
}
