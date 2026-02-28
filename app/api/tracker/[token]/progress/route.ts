// GET /api/tracker/[token]/progress — fetch full check-in history + leaderboard
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcStreak, calc7DayAdherence } from '@/lib/tracker'
import { DailyCheckin } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params

  // Fetch challenge
  const { data: challenge, error } = await supabaseAdmin
    .from('challenges')
    .select(`
      *,
      habit_1:habits!challenges_habit_1_id_fkey(id, name, description, difficulty, simpler_version),
      habit_2:habits!challenges_habit_2_id_fkey(id, name, description, difficulty, simpler_version),
      habit_3:habits!challenges_habit_3_id_fkey(id, name, description, difficulty, simpler_version),
      habit_4:habits!challenges_habit_4_id_fkey(id, name, description, difficulty, simpler_version),
      habit_5:habits!challenges_habit_5_id_fkey(id, name, description, difficulty, simpler_version)
    `)
    .eq('token', token)
    .single()

  if (error || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  // Fetch all check-ins
  const { data: checkins } = await supabaseAdmin
    .from('daily_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('check_date', { ascending: true })

  const allCheckins: DailyCheckin[] = checkins ?? []

  // Per-habit streaks and adherence
  const habitStats = ([1, 2, 3, 4, 5] as const).map((slot) => ({
    slot,
    streak: calcStreak(allCheckins, slot),
    adherence7Day: calc7DayAdherence(allCheckins, slot),
  }))

  // Cohort leaderboard — all active challenges (anonymized)
  const { data: cohortData } = await supabaseAdmin
    .from('challenges')
    .select('id, user_name, start_date, duration_days, token')
    .eq('status', 'active')
    .eq('duration_days', challenge.duration_days)
    .limit(20)

  const leaderboard = []
  if (cohortData) {
    for (const c of cohortData) {
      const { data: cCheckins } = await supabaseAdmin
        .from('daily_checkins')
        .select('*')
        .eq('challenge_id', c.id)

      const cc: DailyCheckin[] = cCheckins ?? []
      const completed = cc.filter((ch) =>
        [ch.habit_1_done, ch.habit_2_done, ch.habit_3_done, ch.habit_4_done, ch.habit_5_done].some(Boolean)
      ).length

      leaderboard.push({
        user_name: c.user_name ?? 'Anonymous',
        completedDays: completed,
        token: c.token,
        isYou: c.token === token,
      })
    }
    leaderboard.sort((a, b) => b.completedDays - a.completedDays)
  }

  // Group leaderboard (if user is in a group)
  const { data: memberData } = await supabaseAdmin
    .from('group_members')
    .select('group_id, groups(id, name, invite_code)')
    .eq('challenge_id', challenge.id)
    .single()

  let groupLeaderboard = null
  if (memberData) {
    const groupId = memberData.group_id
    const { data: groupMembers } = await supabaseAdmin
      .from('group_members')
      .select('challenge_id, challenges(id, user_name, start_date, duration_days, token)')
      .eq('group_id', groupId)

    if (groupMembers) {
      const groupBoard = []
      for (const gm of groupMembers) {
        const gc = gm.challenges as unknown as { id: number; user_name: string; token: string }
        if (!gc) continue
        const { data: gCheckins } = await supabaseAdmin
          .from('daily_checkins')
          .select('*')
          .eq('challenge_id', gc.id)

        const gcc: DailyCheckin[] = gCheckins ?? []
        const completed = gcc.filter((ch) =>
          [ch.habit_1_done, ch.habit_2_done, ch.habit_3_done, ch.habit_4_done, ch.habit_5_done].some(Boolean)
        ).length

        groupBoard.push({
          user_name: gc.user_name ?? 'Anonymous',
          completedDays: completed,
          isYou: gc.token === token,
        })
      }
      groupBoard.sort((a, b) => b.completedDays - a.completedDays)
      groupLeaderboard = {
        groupName: (memberData.groups as unknown as { name: string })?.name ?? 'Group',
        members: groupBoard,
      }
    }
  }

  return NextResponse.json({
    challenge,
    checkins: allCheckins,
    habitStats,
    leaderboard,
    groupLeaderboard,
  })
}
