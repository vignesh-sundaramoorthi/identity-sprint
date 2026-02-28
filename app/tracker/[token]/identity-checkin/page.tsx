'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface IdentityCheckinData {
  challenge: { id: number; user_name: string; start_date: string }
  week_number: number
  identity_goal: string | null
  declaration: string | null
  this_week_checkin: {
    id: number
    week_number: number
    identity_rating: number
    reflection: string | null
    created_at: string
  } | null
  all_checkins: Array<{
    week_number: number
    identity_rating: number
    reflection: string | null
    created_at: string
  }>
}

const RATING_LABELS: Record<number, string> = {
  1: 'Far away',
  2: 'Not quite',
  3: 'Getting closer',
  4: 'Nearly there',
  5: 'This is who I\'m becoming',
}

const RATING_COLORS: Record<number, string> = {
  1: 'bg-red-50 border-red-200 text-red-700',
  2: 'bg-orange-50 border-orange-200 text-orange-700',
  3: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  4: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  5: 'bg-stone-800 border-stone-700 text-white',
}

type PageState = 'loading' | 'error' | 'ready' | 'submitting' | 'saved'

export default function IdentityCheckinPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [data, setData] = useState<IdentityCheckinData | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [rating, setRating] = useState<number | null>(null)
  const [reflection, setReflection] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch(`/api/tracker/${token}/identity-checkin`)
      .then((r) => r.json())
      .then((d: IdentityCheckinData & { error?: string }) => {
        if (d.error) {
          setPageState('error')
          return
        }
        setData(d)
        // Pre-fill if already checked in this week
        if (d.this_week_checkin) {
          setRating(d.this_week_checkin.identity_rating)
          setReflection(d.this_week_checkin.reflection ?? '')
        }
        setPageState('ready')
      })
      .catch(() => setPageState('error'))
  }, [token])

  const handleSubmit = async () => {
    if (!rating) {
      setErrorMsg('Move the slider to share how you felt this week.')
      return
    }
    setErrorMsg('')
    setPageState('submitting')

    try {
      const res = await fetch(`/api/tracker/${token}/identity-checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity_rating: rating,
          reflection: reflection.trim() || null,
          week_number: data?.week_number,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setPageState('saved')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setPageState('ready')
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <p className="text-2xl mb-4">🔗</p>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Link not found</h2>
          <p className="text-gray-500 text-sm">Check your email for the correct link.</p>
        </div>
      </div>
    )
  }

  if (pageState === 'saved') {
    const ratingLabel = rating ? RATING_LABELS[rating] : ''
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reflection saved.</h1>
          <p className="text-gray-500 text-sm mb-8">Week {data?.week_number}: &ldquo;{ratingLabel}&rdquo;</p>
          <button
            onClick={() => router.push(`/tracker/${token}`)}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white py-4 rounded-2xl font-semibold transition-colors"
          >
            Back to tracker →
          </button>
        </div>
      </div>
    )
  }

  const identityGoal = data?.identity_goal
  const declaration = data?.declaration
  const weekNumber = data?.week_number ?? 1
  const allCheckins = data?.all_checkins ?? []

  // Display the most meaningful identity anchor:
  // Prefer the declared "I am becoming..." over the raw identity_goal
  const identityAnchor = declaration ?? identityGoal

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Week {weekNumber} check-in</p>
            <h1 className="text-2xl font-bold text-gray-900">Your identity, in your own words.</h1>
          </div>
          <button
            onClick={() => router.push(`/tracker/${token}`)}
            className="text-stone-400 hover:text-stone-600 text-sm"
          >
            ← Tracker
          </button>
        </div>

        {/* Identity mirror */}
        {identityAnchor && (
          <div className="mb-8">
            <p className="text-stone-500 text-sm mb-3">You said you wanted to become:</p>
            <div className="bg-white border-l-4 border-stone-700 rounded-r-2xl pl-5 pr-6 py-4">
              <p className="text-stone-800 text-base leading-relaxed font-medium">
                &ldquo;{identityAnchor}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Rating question */}
        <div className="mb-8">
          <p className="text-gray-700 font-medium mb-4">
            This week, how close did you feel to that person?
          </p>

          {/* Rating buttons */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRating(r)
                  if (errorMsg) setErrorMsg('')
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  rating === r
                    ? RATING_COLORS[r] + ' border-2'
                    : 'bg-white border-stone-100 hover:border-stone-200 text-stone-700'
                }`}
              >
                <span className={`text-lg font-bold w-6 text-center flex-shrink-0 ${
                  rating === r ? '' : 'text-stone-400'
                }`}>
                  {r}
                </span>
                <span className={`text-sm font-medium ${rating === r ? '' : 'text-stone-600'}`}>
                  {RATING_LABELS[r]}
                </span>
                {rating === r && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Reflection */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">
            What happened this week that moved you toward — or away from — that person?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Be honest. This is just for you."
            rows={4}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 resize-none text-sm leading-relaxed transition-colors"
            maxLength={1000}
          />
          <p className="text-stone-400 text-xs mt-1">{reflection.length}/1000</p>
        </div>

        {/* Past check-ins (if any) */}
        {allCheckins.length > 0 && (
          <div className="mb-8">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Your journey so far</p>
            <div className="space-y-2">
              {allCheckins.map((c) => (
                <div key={c.week_number} className="bg-white rounded-xl p-3 flex items-center gap-3 border border-stone-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <span className="text-stone-600 font-bold text-sm">{c.identity_rating}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-600 text-xs font-medium">Week {c.week_number}</p>
                    <p className="text-stone-400 text-xs">{RATING_LABELS[c.identity_rating]}</p>
                  </div>
                  {/* Mini bar */}
                  <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full bg-stone-600 rounded-full"
                      style={{ width: `${(c.identity_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={pageState === 'submitting'}
          className="w-full bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white py-4 rounded-2xl font-semibold text-base transition-colors"
        >
          {pageState === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving reflection...
            </span>
          ) : data?.this_week_checkin ? 'Update reflection' : 'Save reflection'}
        </button>
      </div>
    </div>
  )
}
