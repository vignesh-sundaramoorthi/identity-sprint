// Identity Sprint — Shared Types

export interface HabitDomain {
  id: number
  name: string
  emoji: string | null
  created_at: string
}

export interface Habit {
  id: number
  domain_id: number | null
  name: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  simpler_version: string | null
  created_at: string
  habit_domains?: HabitDomain
}

export interface Challenge {
  id: number
  token: string
  user_email: string
  user_name: string | null
  duration_days: 21 | 30 | 66 | 100
  start_date: string
  status: 'active' | 'completed' | 'paused'
  habit_1_id: number | null
  habit_2_id: number | null
  habit_3_id: number | null
  habit_4_id: number | null
  habit_5_id: number | null
  created_at: string
  // Joined
  habit_1?: Habit | null
  habit_2?: Habit | null
  habit_3?: Habit | null
  habit_4?: Habit | null
  habit_5?: Habit | null
}

export interface DailyCheckin {
  id: number
  challenge_id: number
  check_date: string
  habit_1_done: boolean
  habit_2_done: boolean
  habit_3_done: boolean
  habit_4_done: boolean
  habit_5_done: boolean
  mood: number | null
  note: string | null
  created_at: string
}

export interface Group {
  id: number
  name: string
  invite_code: string
  created_at: string
}

export interface GroupMember {
  id: number
  group_id: number
  challenge_id: number
  joined_at: string
}

// Computed types for UI
export interface HabitSlot {
  slot: 1 | 2 | 3 | 4 | 5
  habit: Habit | null
  done: boolean
  streak: number
  isPrimary: boolean // slots 1-3
}

export interface ChallengeProgress {
  dayNumber: number           // current day in challenge (1-indexed)
  totalDays: number           // challenge duration
  completedDays: number       // days with at least 1 habit done
  todayCompletionPct: number  // 0-100
  overallAdherencePct: number // 0-100
  milestones: number[]        // milestone days for this duration
  isMilestoneDay: boolean
  nextMilestone: number | null
}

export interface LeaderboardEntry {
  user_name: string
  completedDays: number
  adherencePct: number
  currentStreak: number
  token: string  // for display identity
}
