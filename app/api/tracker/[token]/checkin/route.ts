// POST /api/tracker/[token]/checkin — submit today's check-in
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTodayDateStr, calc7DayAdherence, getMilestones, getDayNumber } from '@/lib/tracker'
import { sendMilestoneNotification, sendLowAdherenceNotification } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  const body = await req.json()

  // Fetch challenge
  const { data: challenge, error: challengeError } = await supabaseAdmin
    .from('challenges')
    .select(`
      *,
      habit_1:habits!challenges_habit_1_id_fkey(id, name, simpler_version),
      habit_2:habits!challenges_habit_2_id_fkey(id, name, simpler_version),
      habit_3:habits!challenges_habit_3_id_fkey(id, name, simpler_version),
      habit_4:habits!challenges_habit_4_id_fkey(id, name, simpler_version),
      habit_5:habits!challenges_habit_5_id_fkey(id, name, simpler_version)
    `)
    .eq('token', token)
    .single()

  if (challengeError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  const today = getTodayDateStr()

  // Upsert today's check-in
  const checkinData = {
    challenge_id: challenge.id,
    check_date: today,
    habit_1_done: body.habit_1_done ?? false,
    habit_2_done: body.habit_2_done ?? false,
    habit_3_done: body.habit_3_done ?? false,
    habit_4_done: body.habit_4_done ?? false,
    habit_5_done: body.habit_5_done ?? false,
    mood: body.mood ?? null,
    note: body.note ?? null,
  }

  const { data: checkin, error: checkinError } = await supabaseAdmin
    .from('daily_checkins')
    .upsert(checkinData, { onConflict: 'challenge_id,check_date' })
    .select()
    .single()

  if (checkinError) {
    return NextResponse.json({ error: checkinError.message }, { status: 500 })
  }

  // Fetch all checkins for analysis
  const { data: allCheckins } = await supabaseAdmin
    .from('daily_checkins')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('check_date', { ascending: false })

  const checkins = allCheckins ?? []

  // ── Milestone Check ──────────────────────────────────────────
  const dayNumber = getDayNumber(challenge.start_date)
  const milestones = getMilestones(challenge.duration_days)

  if (milestones.includes(dayNumber)) {
    // Check if we haven't already sent this milestone email (avoid duplicates)
    const sentKey = `milestone_${challenge.id}_day_${dayNumber}`
    // Simple approach: check if we've already logged it in meta
    // For MVP: just send (Resend will deduplicate at most once/day)
    await sendMilestoneNotification({
      userName: challenge.user_name ?? challenge.user_email,
      userEmail: challenge.user_email,
      dayNumber,
      durationDays: challenge.duration_days,
      token,
    })
  }

  // ── Adaptive Algorithm ───────────────────────────────────────
  const adaptiveSuggestions: Array<{ slot: number; habitName: string; simplerVersion: string | null; adherencePct: number }> = []
  const habitSlots: Array<{ slot: 1|2|3|4|5; habit: { name: string; simpler_version: string | null } | null }> = [
    { slot: 1, habit: challenge.habit_1 },
    { slot: 2, habit: challenge.habit_2 },
    { slot: 3, habit: challenge.habit_3 },
    { slot: 4, habit: challenge.habit_4 },
    { slot: 5, habit: challenge.habit_5 },
  ]

  for (const { slot, habit } of habitSlots) {
    if (!habit) continue
    const adherencePct = calc7DayAdherence(checkins, slot)
    if (adherencePct < 60) {
      adaptiveSuggestions.push({
        slot,
        habitName: habit.name,
        simplerVersion: habit.simpler_version,
        adherencePct,
      })
      // Send coach notification
      await sendLowAdherenceNotification({
        userName: challenge.user_name ?? challenge.user_email,
        userEmail: challenge.user_email,
        habitName: habit.name,
        adherencePct,
        simplerVersion: habit.simpler_version,
        token,
      })
    }
  }

  return NextResponse.json({
    success: true,
    checkin,
    isMilestoneDay: milestones.includes(dayNumber),
    dayNumber,
    adaptiveSuggestions, // returned to UI so it can show encouragement modal
  })
}
