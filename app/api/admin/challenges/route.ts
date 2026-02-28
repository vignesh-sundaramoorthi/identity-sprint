// Admin Challenges API
// POST /api/admin/challenges — create new challenge (generates token)
// GET  /api/admin/challenges — list all challenges with stats

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken, getDayNumber } from '@/lib/tracker'
import { DailyCheckin } from '@/lib/types'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    user_email,
    user_name,
    duration_days,
    start_date,
    habit_1_id,
    habit_2_id,
    habit_3_id,
    habit_4_id,
    habit_5_id,
  } = body

  if (!user_email || !duration_days || !start_date) {
    return NextResponse.json(
      { error: 'user_email, duration_days, and start_date are required' },
      { status: 400 }
    )
  }

  if (![21, 30, 66, 100].includes(Number(duration_days))) {
    return NextResponse.json(
      { error: 'duration_days must be 21, 30, 66, or 100' },
      { status: 400 }
    )
  }

  const token = generateToken()

  const { data, error } = await supabaseAdmin
    .from('challenges')
    .insert({
      token,
      user_email,
      user_name: user_name ?? null,
      duration_days: Number(duration_days),
      start_date,
      status: 'active',
      habit_1_id: habit_1_id ?? null,
      habit_2_id: habit_2_id ?? null,
      habit_3_id: habit_3_id ?? null,
      habit_4_id: habit_4_id ?? null,
      habit_5_id: habit_5_id ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const trackerUrl = `/tracker/${token}`
  return NextResponse.json({ success: true, challenge: data, token, trackerUrl }, { status: 201 })
}

export async function GET() {
  // Fetch all challenges with habit info
  const { data: challenges, error } = await supabaseAdmin
    .from('challenges')
    .select(`
      *,
      habit_1:habits!challenges_habit_1_id_fkey(id, name),
      habit_2:habits!challenges_habit_2_id_fkey(id, name),
      habit_3:habits!challenges_habit_3_id_fkey(id, name),
      habit_4:habits!challenges_habit_4_id_fkey(id, name),
      habit_5:habits!challenges_habit_5_id_fkey(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with adherence stats
  const enriched = await Promise.all(
    (challenges ?? []).map(async (c) => {
      const { data: checkins } = await supabaseAdmin
        .from('daily_checkins')
        .select('*')
        .eq('challenge_id', c.id)

      const cc: DailyCheckin[] = checkins ?? []
      const dayNumber = getDayNumber(c.start_date)
      const completedDays = cc.filter((ch) =>
        [ch.habit_1_done, ch.habit_2_done, ch.habit_3_done, ch.habit_4_done, ch.habit_5_done].some(Boolean)
      ).length

      const habitCount = [c.habit_1_id, c.habit_2_id, c.habit_3_id, c.habit_4_id, c.habit_5_id].filter(Boolean).length
      const possible = Math.min(dayNumber, c.duration_days) * habitCount
      const actual = cc.reduce((sum, ch) => sum + [
        ch.habit_1_done, ch.habit_2_done, ch.habit_3_done, ch.habit_4_done, ch.habit_5_done,
      ].filter(Boolean).length, 0)

      return {
        ...c,
        dayNumber,
        completedDays,
        adherencePct: possible > 0 ? Math.round((actual / possible) * 100) : 0,
        trackerUrl: `/tracker/${c.token}`,
      }
    })
  )

  return NextResponse.json(enriched)
}
