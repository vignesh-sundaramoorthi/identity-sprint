'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Challenge, DailyCheckin } from '@/lib/types'
import { calcProgress, calcStreak, getMilestones, getDayNumber } from '@/lib/tracker'

interface HabitStat {
  slot: number
  streak: number
  adherence7Day: number
}

interface LeaderboardEntry {
  user_name: string
  completedDays: number
  isYou: boolean
  token: string
}

interface GroupLeaderboard {
  groupName: string
  members: Array<{ user_name: string; completedDays: number; isYou: boolean }>
}

interface ProgressData {
  challenge: Challenge
  checkins: DailyCheckin[]
  habitStats: HabitStat[]
  leaderboard: LeaderboardEntry[]
  groupLeaderboard: GroupLeaderboard | null
}

// Calendar heatmap: generate grid of dates
function generateCalendarData(
  startDate: string,
  durationDays: number,
  checkins: DailyCheckin[]
): Array<{ date: string; pct: number; isToday: boolean; isFuture: boolean }> {
  const start = new Date(startDate)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const checkinMap = new Map(checkins.map((c) => [c.check_date, c]))

  return Array.from({ length: durationDays }, (_, i) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + i)
    date.setUTCHours(0, 0, 0, 0)

    const dateStr = date.toISOString().split('T')[0]
    const isToday = date.getTime() === today.getTime()
    const isFuture = date.getTime() > today.getTime()

    const checkin = checkinMap.get(dateStr)
    let pct = 0
    if (checkin) {
      const done = [
        checkin.habit_1_done, checkin.habit_2_done, checkin.habit_3_done,
        checkin.habit_4_done, checkin.habit_5_done,
      ].filter(Boolean).length
      pct = Math.round((done / 5) * 100)
    }

    return { date: dateStr, pct, isToday, isFuture }
  })
}

function getPctColor(pct: number, isFuture: boolean, isToday: boolean): string {
  if (isFuture) return 'bg-gray-100'
  if (isToday && pct === 0) return 'bg-purple-200 ring-2 ring-purple-400'
  if (pct === 0) return 'bg-gray-200'
  if (pct < 40) return 'bg-purple-200'
  if (pct < 70) return 'bg-purple-400'
  return 'bg-purple-600'
}

export default function ProgressPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>('overview')

  useEffect(() => {
    fetch(`/api/tracker/${token}/progress`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load progress'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">{error ?? 'Something went wrong'}</p>
      </div>
    )
  }

  const { challenge, checkins, habitStats, leaderboard, groupLeaderboard } = data
  const progress = calcProgress(challenge, checkins)
  const calendarData = generateCalendarData(challenge.start_date, challenge.duration_days, checkins)
  const milestones = getMilestones(challenge.duration_days)
  const dayNumber = getDayNumber(challenge.start_date)

  const habits = [
    { slot: 1, habit: challenge.habit_1 },
    { slot: 2, habit: challenge.habit_2 },
    { slot: 3, habit: challenge.habit_3 },
    { slot: 4, habit: challenge.habit_4 },
    { slot: 5, habit: challenge.habit_5 },
  ].filter((h) => h.habit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/tracker/${token}`)}
            className="text-purple-600 font-medium"
          >
            ← Today
          </button>
          <h1 className="font-black text-gray-900 text-lg">Progress</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-purple-600">{progress.completedDays}</p>
            <p className="text-xs text-gray-500">Days done</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-purple-600">{progress.overallAdherencePct}%</p>
            <p className="text-xs text-gray-500">Adherence</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-purple-600">
              {Math.max(...habitStats.map((s) => s.streak), 0)}🔥
            </p>
            <p className="text-xs text-gray-500">Best streak</p>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Milestones</h2>
          <div className="flex gap-3">
            {milestones.map((m) => (
              <div key={m} className={`flex-1 rounded-xl p-3 text-center ${
                dayNumber >= m ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-400'
              }`}>
                <p className="text-lg">{dayNumber >= m ? '🏆' : '🔒'}</p>
                <p className="text-xs font-bold">Day {m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-2xl mb-4 shadow-sm">
          {(['overview', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Calendar Heatmap */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">Activity Calendar</h2>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
              >
                {/* Day labels */}
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-xs text-gray-400 mb-1">{d}</div>
                ))}
                {/* Calendar cells */}
                {calendarData.map((day) => (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-sm ${getPctColor(day.pct, day.isFuture, day.isToday)}`}
                    title={`${day.date}: ${day.pct}%`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">Less</span>
                <div className="flex gap-1">
                  {['bg-gray-200', 'bg-purple-200', 'bg-purple-400', 'bg-purple-600'].map((c, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">More</span>
              </div>
            </div>

            {/* Per-habit Stats */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">Habit Streaks</h2>
              <div className="space-y-3">
                {habits.map(({ slot, habit }) => {
                  if (!habit) return null
                  const stat = habitStats.find((s) => s.slot === slot)
                  const streak = stat?.streak ?? 0
                  const adh = stat?.adherence7Day ?? 100

                  return (
                    <div key={slot} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        slot <= 3 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-700'
                      }`}>
                        {slot}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{habit.name}</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${adh >= 60 ? 'bg-purple-500' : 'bg-orange-400'}`}
                            style={{ width: `${adh}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-orange-500">🔥 {streak}</p>
                        <p className="text-xs text-gray-400">{adh}% (7d)</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            {/* Group Leaderboard */}
            {groupLeaderboard && (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-1">{groupLeaderboard.groupName}</h2>
                <p className="text-xs text-gray-400 mb-3">Friend group</p>
                <div className="space-y-2">
                  {groupLeaderboard.members.map((m, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${m.isYou ? 'bg-purple-50' : ''}`}>
                      <span className="text-lg font-black text-gray-300 w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </span>
                      <span className={`flex-1 font-medium text-sm ${m.isYou ? 'text-purple-700' : 'text-gray-800'}`}>
                        {m.user_name} {m.isYou && '(you)'}
                      </span>
                      <span className="text-sm font-bold text-gray-600">{m.completedDays}d</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cohort Leaderboard */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-1">Cohort Board</h2>
              <p className="text-xs text-gray-400 mb-3">{challenge.duration_days}-day challengers</p>
              {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Just you for now — more challengers coming!</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 10).map((entry, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-xl ${entry.isYou ? 'bg-purple-50' : ''}`}>
                      <span className="text-lg font-black text-gray-300 w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </span>
                      <span className={`flex-1 font-medium text-sm ${entry.isYou ? 'text-purple-700' : 'text-gray-800'}`}>
                        {entry.user_name} {entry.isYou && '(you)'}
                      </span>
                      <span className="text-sm font-bold text-gray-600">{entry.completedDays}d</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
