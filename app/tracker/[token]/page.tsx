'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Challenge, DailyCheckin } from '@/lib/types'
import {
  calcProgress,
  calcStreak,
  getMotivationalMessage,
  getMilestones,
  getDayNumber,
} from '@/lib/tracker'

interface AdaptiveSuggestion {
  slot: number
  habitName: string
  simplerVersion: string | null
  adherencePct: number
}

interface CheckinResponse {
  success: boolean
  checkin: DailyCheckin
  isMilestoneDay: boolean
  dayNumber: number
  adaptiveSuggestions: AdaptiveSuggestion[]
}

export default function TrackerPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null)
  const [allCheckins, setAllCheckins] = useState<DailyCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Local state for today's habit toggles
  const [habits, setHabits] = useState({ h1: false, h2: false, h3: false, h4: false, h5: false })
  const [mood, setMood] = useState<number | null>(null)
  const [note, setNote] = useState('')

  // Celebration / suggestion state
  const [showMilestone, setShowMilestone] = useState(false)
  const [milestoneDay, setMilestoneDay] = useState<number | null>(null)
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState<AdaptiveSuggestion[]>([])
  const [showAdaptive, setShowAdaptive] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [trackerRes, progressRes] = await Promise.all([
        fetch(`/api/tracker/${token}`),
        fetch(`/api/tracker/${token}/progress`),
      ])

      if (!trackerRes.ok) {
        setError('Challenge not found. Check your link.')
        setLoading(false)
        return
      }

      const trackerData = await trackerRes.json()
      const progressData = progressRes.ok ? await progressRes.json() : null

      setChallenge(trackerData.challenge)
      setAllCheckins(progressData?.checkins ?? [])

      if (trackerData.todayCheckin) {
        const c = trackerData.todayCheckin
        setTodayCheckin(c)
        setHabits({
          h1: c.habit_1_done,
          h2: c.habit_2_done,
          h3: c.habit_3_done,
          h4: c.habit_4_done,
          h5: c.habit_5_done,
        })
        setMood(c.mood)
        setNote(c.note ?? '')
      }
    } catch {
      setError('Failed to load. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Check if setup is needed
  useEffect(() => {
    if (challenge && !challenge.habit_1_id && !challenge.habit_2_id) {
      router.push(`/tracker/${token}/setup`)
    }
  }, [challenge, token, router])

  const handleToggle = (slot: 'h1' | 'h2' | 'h3' | 'h4' | 'h5') => {
    setHabits((prev) => ({ ...prev, [slot]: !prev[slot] }))
  }

  const handleSave = async () => {
    if (!challenge) return
    setSaving(true)
    try {
      const res = await fetch(`/api/tracker/${token}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_1_done: habits.h1,
          habit_2_done: habits.h2,
          habit_3_done: habits.h3,
          habit_4_done: habits.h4,
          habit_5_done: habits.h5,
          mood,
          note: note || null,
        }),
      })

      if (!res.ok) throw new Error('Save failed')

      const data: CheckinResponse = await res.json()
      setTodayCheckin(data.checkin)

      if (data.isMilestoneDay) {
        setMilestoneDay(data.dayNumber)
        setShowMilestone(true)
      } else if (data.adaptiveSuggestions.length > 0) {
        setAdaptiveSuggestions(data.adaptiveSuggestions)
        setShowAdaptive(true)
      }

      // Refresh data
      await loadData()
    } catch {
      alert('Failed to save check-in. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your tracker...</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-lg">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link not found</h2>
          <p className="text-gray-500">{error ?? 'This tracker link is invalid. Check your email for the correct link.'}</p>
        </div>
      </div>
    )
  }

  const progress = calcProgress(challenge, allCheckins)
  const dayNumber = getDayNumber(challenge.start_date)

  // Per-habit streaks
  const streaks = {
    h1: calcStreak(allCheckins, 1),
    h2: calcStreak(allCheckins, 2),
    h3: calcStreak(allCheckins, 3),
    h4: calcStreak(allCheckins, 4),
    h5: calcStreak(allCheckins, 5),
  }

  const maxStreak = Math.max(...Object.values(streaks))
  const motivational = getMotivationalMessage(
    dayNumber,
    challenge.duration_days,
    progress.todayCompletionPct,
    maxStreak
  )

  const habitSlots = [
    { key: 'h1' as const, habit: challenge.habit_1, streak: streaks.h1, slot: 1 },
    { key: 'h2' as const, habit: challenge.habit_2, streak: streaks.h2, slot: 2 },
    { key: 'h3' as const, habit: challenge.habit_3, streak: streaks.h3, slot: 3 },
    { key: 'h4' as const, habit: challenge.habit_4, streak: streaks.h4, slot: 4 },
    { key: 'h5' as const, habit: challenge.habit_5, streak: streaks.h5, slot: 5 },
  ].filter((s) => s.habit)

  const milestones = getMilestones(challenge.duration_days)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Milestone Celebration Modal */}
      {showMilestone && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Milestone Reached!</h2>
            <p className="text-purple-600 font-semibold text-lg mb-4">Day {milestoneDay} Complete</p>
            <p className="text-gray-600 mb-6">
              You&apos;ve hit a major milestone. Your coach has been notified — time for a reflection session.
              What has changed in you since you started?
            </p>
            <button
              onClick={() => setShowMilestone(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Keep Going 💪
            </button>
          </div>
        </div>
      )}

      {/* Adaptive Suggestion Modal */}
      {showAdaptive && adaptiveSuggestions.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-4xl mb-4 text-center">💙</div>
            <h2 className="text-xl font-black text-gray-900 mb-2 text-center">Let&apos;s Adjust</h2>
            <p className="text-gray-600 mb-4 text-center text-sm">
              Progress over perfection. Here are some lighter alternatives to help you stay consistent:
            </p>
            <div className="space-y-3 mb-6">
              {adaptiveSuggestions.map((s) => (
                <div key={s.slot} className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Instead of: {s.habitName}</p>
                  <p className="font-semibold text-purple-700">→ {s.simplerVersion ?? 'Show up for just 5 minutes'}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.adherencePct}% last 7 days</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">
              Your coach has been notified and will check in with you.
            </p>
            <button
              onClick={() => setShowAdaptive(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Got it, I&apos;ll adapt 🌱
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-purple-600 font-semibold">Day {dayNumber} of {challenge.duration_days}</p>
            <h1 className="text-xl font-black text-gray-900">
              {challenge.user_name ? `${challenge.user_name.split(' ')[0]}'s Sprint` : 'Identity Sprint'}
            </h1>
          </div>
          <button
            onClick={() => router.push(`/tracker/${token}/progress`)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Progress →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Challenge Progress</span>
            <span className="text-sm font-bold text-purple-600">
              {progress.completedDays}/{challenge.duration_days} days
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.completedDays / challenge.duration_days) * 100)}%` }}
            />
          </div>
          {/* Milestone markers */}
          <div className="flex gap-2 flex-wrap">
            {milestones.map((m) => (
              <span
                key={m}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  dayNumber >= m
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Day {m} {dayNumber >= m ? '✓' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 mb-4 text-white">
          <p className="font-medium text-sm">{motivational}</p>
        </div>

        {/* Today's Habits */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Today&apos;s Habits</h2>
            <span className="text-sm font-medium text-purple-600">
              {progress.todayCompletionPct}% done
            </span>
          </div>

          <div className="space-y-3">
            {habitSlots.map(({ key, habit, streak, slot }) => {
              if (!habit) return null
              const done = habits[key]
              const isPrimary = slot <= 3

              return (
                <button
                  key={slot}
                  onClick={() => handleToggle(key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    done
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}>
                    {done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Habit info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-medium text-sm ${done ? 'text-purple-700 line-through' : 'text-gray-900'}`}>
                        {habit.name}
                      </p>
                      {isPrimary && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{habit.description}</p>
                    )}
                  </div>

                  {/* Streak */}
                  {streak > 0 && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-orange-500 font-bold text-sm">🔥 {streak}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mood & Note */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">How are you feeling?</h3>
          <div className="flex gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m === mood ? null : m)}
                className={`flex-1 text-xl py-2 rounded-xl transition-all ${
                  mood === m ? 'bg-purple-100 scale-110' : 'hover:bg-gray-50'
                }`}
              >
                {['😔', '😕', '😐', '🙂', '😄'][m - 1]}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional: one sentence about your day..."
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-purple-400 text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-purple-200"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : todayCheckin ? 'Update Check-in ✓' : 'Save Today\'s Check-in'}
        </button>
      </div>
    </div>
  )
}
