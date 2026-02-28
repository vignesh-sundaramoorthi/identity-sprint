// Identity Sprint — Tracker Utilities

import { Challenge, DailyCheckin, ChallengeProgress, Habit } from './types'

// ============================================================
// Milestone Schedules
// ============================================================
export const MILESTONE_DAYS: Record<number, number[]> = {
  21: [7, 14, 21],
  30: [10, 20, 30],
  66: [21, 44, 66],
  100: [25, 50, 75, 100],
}

export function getMilestones(durationDays: number): number[] {
  return MILESTONE_DAYS[durationDays] ?? []
}

// ============================================================
// Day calculation
// ============================================================
export function getDayNumber(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  // Normalize to midnight UTC
  start.setUTCHours(0, 0, 0, 0)
  today.setUTCHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1) // day 1 = start date
}

export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ============================================================
// Progress Calculation
// ============================================================
export function calcProgress(
  challenge: Challenge,
  checkins: DailyCheckin[]
): ChallengeProgress {
  const dayNumber = getDayNumber(challenge.start_date)
  const milestones = getMilestones(challenge.duration_days)

  const completedDays = checkins.filter((c) => {
    const habits = [
      c.habit_1_done, c.habit_2_done, c.habit_3_done,
      c.habit_4_done, c.habit_5_done,
    ]
    // Count as completed if at least 1 habit done
    return habits.some(Boolean)
  }).length

  // Overall adherence: total habit completions / possible completions
  const totalHabitsPerDay = countHabits(challenge)
  const possibleTotal = Math.min(dayNumber, challenge.duration_days) * totalHabitsPerDay
  const actualTotal = checkins.reduce((sum, c) => {
    return sum + [
      c.habit_1_done, c.habit_2_done, c.habit_3_done,
      c.habit_4_done, c.habit_5_done,
    ].filter(Boolean).length
  }, 0)

  const overallAdherencePct = possibleTotal > 0
    ? Math.round((actualTotal / possibleTotal) * 100)
    : 0

  // Today completion
  const today = getTodayDateStr()
  const todayCheckin = checkins.find((c) => c.check_date === today)
  let todayCompletionPct = 0
  if (todayCheckin) {
    const done = [
      todayCheckin.habit_1_done, todayCheckin.habit_2_done, todayCheckin.habit_3_done,
      todayCheckin.habit_4_done, todayCheckin.habit_5_done,
    ].filter(Boolean).length
    todayCompletionPct = totalHabitsPerDay > 0
      ? Math.round((done / totalHabitsPerDay) * 100)
      : 0
  }

  const isMilestoneDay = milestones.includes(dayNumber)
  const nextMilestone = milestones.find((m) => m > dayNumber) ?? null

  return {
    dayNumber,
    totalDays: challenge.duration_days,
    completedDays,
    todayCompletionPct,
    overallAdherencePct,
    milestones,
    isMilestoneDay,
    nextMilestone,
  }
}

function countHabits(challenge: Challenge): number {
  let count = 0
  if (challenge.habit_1_id) count++
  if (challenge.habit_2_id) count++
  if (challenge.habit_3_id) count++
  if (challenge.habit_4_id) count++
  if (challenge.habit_5_id) count++
  return count
}

// ============================================================
// Streak Calculation
// ============================================================
export function calcStreak(checkins: DailyCheckin[], habitSlot: 1|2|3|4|5): number {
  const key = `habit_${habitSlot}_done` as keyof DailyCheckin

  // Sort descending by date
  const sorted = [...checkins].sort((a, b) =>
    b.check_date.localeCompare(a.check_date)
  )

  let streak = 0
  let expected = new Date()
  expected.setUTCHours(0, 0, 0, 0)

  for (const checkin of sorted) {
    const date = new Date(checkin.check_date)
    date.setUTCHours(0, 0, 0, 0)

    const diff = Math.floor(
      (expected.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diff === 0 || diff === 1) {
      if (checkin[key]) {
        streak++
        expected = date
      } else {
        if (diff === 0) {
          // Today not done yet — don't break streak
          continue
        }
        break
      }
    } else {
      break
    }
  }

  return streak
}

// ============================================================
// 7-Day Adherence (for adaptive algorithm)
// ============================================================
export function calc7DayAdherence(
  checkins: DailyCheckin[],
  habitSlot: 1|2|3|4|5
): number {
  const key = `habit_${habitSlot}_done` as keyof DailyCheckin
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const last7: DailyCheckin[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const checkin = checkins.find((c) => c.check_date === dateStr)
    if (checkin) last7.push(checkin)
  }

  if (last7.length === 0) return 100 // no data = no alarm
  const done = last7.filter((c) => c[key]).length
  return Math.round((done / 7) * 100) // out of 7 days, not just days with data
}

// ============================================================
// Motivational Messages
// ============================================================
export function getMotivationalMessage(
  dayNumber: number,
  totalDays: number,
  todayCompletionPct: number,
  streak: number
): string {
  const progress = dayNumber / totalDays

  if (todayCompletionPct === 100) {
    if (streak >= 7) return `🔥 ${streak}-day streak! You're unstoppable.`
    if (streak >= 3) return `💪 ${streak} days strong. Keep the momentum!`
    return '✅ Perfect day. This is who you are becoming.'
  }

  if (dayNumber === 1) return '🌟 Day 1. Every legend starts here. Let\'s go.'
  if (progress <= 0.1) return '🚀 You\'re in the foundation phase. Show up every day.'
  if (progress <= 0.33) return '🌱 Early days build lasting habits. Trust the process.'
  if (progress <= 0.5) return `📅 Day ${dayNumber} of ${totalDays}. Halfway there — don't stop now.`
  if (progress <= 0.75) return '⚡ You\'ve built real momentum. The new you is taking shape.'
  if (progress < 1) return `🏁 Final stretch. Day ${dayNumber} of ${totalDays}. Finish strong.`
  return '🏆 Challenge complete. You did what most people never will.'
}

// ============================================================
// Token Generator (server-side)
// ============================================================
export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const segments = [8, 4, 4].map((len) =>
    Array.from({ length: len }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  )
  return segments.join('-')
}

// ============================================================
// Get habits array from challenge
// ============================================================
export function getChallengeHabits(challenge: Challenge): (Habit | null)[] {
  return [
    challenge.habit_1 ?? null,
    challenge.habit_2 ?? null,
    challenge.habit_3 ?? null,
    challenge.habit_4 ?? null,
    challenge.habit_5 ?? null,
  ]
}
