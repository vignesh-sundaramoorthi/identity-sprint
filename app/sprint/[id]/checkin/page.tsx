'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Application {
  id: number
  name: string
  identity_goal: string
}

interface Checkin {
  id: number
  week_number: number
  identity_rating: number
  reflection_text: string | null
  created_at: string
}

// Determine which week number it is (Week 1 = days 1–7, Week 2 = days 8–14, etc.)
// For MVP: we just let the system auto-detect or default to the next uncompleted week
function getCurrentWeek(checkins: Checkin[]): number {
  if (checkins.length === 0) return 1
  const maxWeek = Math.max(...checkins.map((c) => c.week_number))
  return maxWeek + 1
}

export default function CheckinPage() {
  const params = useParams()
  const id = params.id as string

  const [application, setApplication] = useState<Application | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [rating, setRating] = useState<number>(3)
  const [reflection, setReflection] = useState('')

  // Which week this check-in is for
  const [weekNumber, setWeekNumber] = useState(1)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/sprint/${id}/checkin`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Not found')
        return
      }
      const data = await res.json()
      setApplication(data.application)
      setCheckins(data.checkins)
      setWeekNumber(getCurrentWeek(data.checkins))
    } catch {
      setError('Failed to load. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async () => {
    if (!application) return
    setSaving(true)
    try {
      const res = await fetch(`/api/sprint/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_number: weekNumber,
          identity_rating: rating,
          reflection_text: reflection.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Failed to save. Please try again.')
        return
      }

      setSaved(true)
      await loadData()
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Error state
  if (error || !application) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-white text-xl font-semibold mb-2">Check-in not found</p>
          <p className="text-stone-400 text-sm">{error ?? 'Your link may be incorrect.'}</p>
        </div>
      </div>
    )
  }

  // Already done all weeks up to current — show existing history
  const currentWeekCheckin = checkins.find((c) => c.week_number === weekNumber)
  const hasCompletedThisWeek = !!currentWeekCheckin

  if (saved || hasCompletedThisWeek) {
    const checkin = currentWeekCheckin
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Check mark */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <p className="text-stone-400 text-sm text-center mb-2">Week {weekNumber - 1} check-in complete</p>
          <h2 className="text-white text-2xl font-bold text-center mb-8">See you next week.</h2>

          {/* Their identity goal */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-6">
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">You said you wanted to become</p>
            <p className="text-white text-base font-medium leading-relaxed">"{application.identity_goal}"</p>
          </div>

          {/* Their rating + reflection */}
          {checkin && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-stone-400 text-sm">Your rating</p>
                <span className="text-white font-bold text-lg">{checkin.identity_rating}/5</span>
              </div>
              {checkin.reflection_text && (
                <p className="text-stone-300 text-sm leading-relaxed italic">"{checkin.reflection_text}"</p>
              )}
            </div>
          )}

          {/* History of past weeks */}
          {checkins.length > 1 && (
            <div className="space-y-3">
              <p className="text-stone-500 text-xs uppercase tracking-widest">Your journey so far</p>
              {checkins.slice().reverse().map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-stone-800 rounded-xl px-4 py-3">
                  <span className="text-stone-400 text-sm">Week {c.week_number}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-3 h-3 rounded-full ${n <= c.identity_rating ? 'bg-white' : 'bg-stone-700'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main check-in form
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-start p-6 pt-12">
      <div className="w-full max-w-md">

        {/* Week badge */}
        <div className="flex justify-center mb-8">
          <span className="text-xs font-semibold text-stone-400 border border-stone-700 rounded-full px-4 py-1 uppercase tracking-widest">
            Week {weekNumber} Check-in
          </span>
        </div>

        {/* Identity goal reflection */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-8">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">You said you wanted to become</p>
          <p className="text-white text-lg font-semibold leading-snug">"{application.identity_goal}"</p>
        </div>

        {/* Rating question */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-bold mb-2">
            How close does this week feel to that person?
          </h2>
          <p className="text-stone-400 text-sm mb-6">1 = far off &nbsp;·&nbsp; 5 = fully living it</p>

          <div className="flex gap-3 justify-between">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`flex-1 aspect-square rounded-2xl text-xl font-bold transition-all duration-150 ${
                  rating === n
                    ? 'bg-white text-stone-950 scale-105 shadow-lg'
                    : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-stone-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection textarea */}
        <div className="mb-8">
          <label className="block text-white font-semibold mb-2">
            What&apos;s one thing that brought you closer — or further — from that identity?
          </label>
          <p className="text-stone-500 text-sm mb-3">2–3 sentences. Honest beats polished.</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="This week I..."
            rows={4}
            className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-600 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-stone-400 transition-colors leading-relaxed"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-white text-stone-950 font-bold py-4 rounded-2xl text-base transition-all hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Submit check-in'
          )}
        </button>

        {/* Past check-ins summary */}
        {checkins.length > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-800">
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">Previous weeks</p>
            <div className="space-y-2">
              {checkins.slice().reverse().map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-stone-400 text-sm">Week {c.week_number}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-2.5 h-2.5 rounded-full ${n <= c.identity_rating ? 'bg-stone-300' : 'bg-stone-700'}`}
                      />
                    ))}
                    <span className="text-stone-500 text-xs ml-2">{c.identity_rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
