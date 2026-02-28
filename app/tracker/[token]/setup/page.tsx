'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Habit, HabitDomain } from '@/lib/types'

const DURATIONS = [
  { days: 21, label: '21 Days', desc: 'Build the foundation', color: 'from-green-400 to-emerald-500' },
  { days: 30, label: '30 Days', desc: 'Solid habit formation', color: 'from-blue-400 to-cyan-500' },
  { days: 66, label: '66 Days', desc: 'True automaticity', color: 'from-purple-500 to-indigo-600' },
  { days: 100, label: '100 Days', desc: 'Identity transformation', color: 'from-orange-500 to-red-500' },
]

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [step, setStep] = useState<'duration' | 'habits' | 'confirm'>('duration')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [domains, setDomains] = useState<HabitDomain[]>([])
  const [selectedHabits, setSelectedHabits] = useState<(number | null)[]>([null, null, null, null, null])
  const [activeDomain, setActiveDomain] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [challengeExists, setChallengeExists] = useState(false)

  useEffect(() => {
    // Check if challenge exists and has habits already
    fetch(`/api/tracker/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.challenge) {
          setChallengeExists(true)
          if (data.challenge.duration_days) setSelectedDuration(data.challenge.duration_days)
          // Pre-select existing habits
          const h = data.challenge
          setSelectedHabits([
            h.habit_1_id, h.habit_2_id, h.habit_3_id, h.habit_4_id, h.habit_5_id,
          ])
          // If habits are already set, skip to tracker
          if (h.habit_1_id || h.habit_2_id) {
            // Already configured — redirect to tracker
            router.push(`/tracker/${token}`)
          }
        }
      })
      .catch(console.error)
  }, [token, router])

  useEffect(() => {
    // Load habit library
    setLoading(true)
    fetch('/api/admin/habits')
      .then((r) => r.json())
      .then((data) => {
        setHabits(data.habits ?? [])
        setDomains(data.domains ?? [])
        if (data.domains?.length > 0) setActiveDomain(data.domains[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const domainHabits = habits.filter((h) => h.domain_id === activeDomain)

  const toggleHabit = (habitId: number, slot: number) => {
    setSelectedHabits((prev) => {
      const next = [...prev]
      // If already selected in some slot, deselect it
      const existingSlot = next.indexOf(habitId)
      if (existingSlot !== -1) {
        next[existingSlot] = null
        return next
      }
      // Otherwise put in specified slot (if slot is open), or first open slot
      if (next[slot] === null) {
        next[slot] = habitId
      } else {
        // Find first open slot
        const firstOpen = next.findIndex((v) => v === null)
        if (firstOpen !== -1) next[firstOpen] = habitId
      }
      return next
    })
  }

  const removeHabit = (slot: number) => {
    setSelectedHabits((prev) => {
      const next = [...prev]
      next[slot] = null
      return next
    })
  }

  const selectedCount = selectedHabits.filter(Boolean).length

  const handleSave = async () => {
    if (!selectedDuration) return
    setSaving(true)
    try {
      // Update challenge with duration + habits
      const body: Record<string, unknown> = {
        duration_days: selectedDuration,
        habit_1_id: selectedHabits[0],
        habit_2_id: selectedHabits[1],
        habit_3_id: selectedHabits[2],
        habit_4_id: selectedHabits[3],
        habit_5_id: selectedHabits[4],
      }

      // If challenge doesn't exist yet, create via admin API
      // If it exists, we update it via a PATCH endpoint
      // For now: use a direct update route
      const res = await fetch(`/api/tracker/${token}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push(`/tracker/${token}`)
      } else {
        const data = await res.json()
        alert(data.error ?? 'Setup failed')
      }
    } catch {
      alert('Setup failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getHabitName = (id: number | null) => {
    if (!id) return null
    return habits.find((h) => h.id === id)?.name ?? null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚡</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Set Up Your Sprint</h1>
          <p className="text-gray-500 text-sm">Choose your challenge and pick your habits</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['duration', 'habits', 'confirm'] as const).map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s === step ? 'bg-purple-600 text-white' :
                (['duration', 'habits', 'confirm'].indexOf(step) > i) ? 'bg-purple-200 text-purple-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Duration */}
        {step === 'duration' && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">How long is your sprint?</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {DURATIONS.map((d) => (
                <button
                  key={d.days}
                  onClick={() => setSelectedDuration(d.days)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedDuration === d.days
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`text-2xl font-black bg-gradient-to-r ${d.color} bg-clip-text text-transparent mb-1`}>
                    {d.label}
                  </div>
                  <p className="text-xs text-gray-500">{d.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedDuration && setStep('habits')}
              disabled={!selectedDuration}
              className="w-full bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold transition-colors"
            >
              Next: Pick Habits →
            </button>
          </div>
        )}

        {/* Step 2: Habits */}
        {step === 'habits' && (
          <div>
            {/* Selected habits */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3">Your Habits ({selectedCount}/5)</h2>
              <div className="space-y-2">
                {selectedHabits.map((habitId, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-xl ${
                      habitId ? 'bg-purple-50' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {getHabitName(habitId) ?? (i < 3 ? 'Primary habit (choose below)' : 'Additional habit (optional)')}
                    </span>
                    {habitId && (
                      <button onClick={() => removeHabit(i)} className="text-gray-400 hover:text-red-400 text-xs">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Habits 1–3 are primary. 4–5 are optional extras.</p>
            </div>

            {/* Domain tabs */}
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading habits...</div>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                  {domains.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setActiveDomain(d.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeDomain === d.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {d.emoji} {d.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  {domainHabits.map((habit) => {
                    const isSelected = selectedHabits.includes(habit.id)
                    return (
                      <button
                        key={habit.id}
                        onClick={() => toggleHabit(habit.id, selectedCount < 3 ? selectedCount : selectedCount)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : selectedCount >= 5
                            ? 'border-gray-100 bg-white opacity-50 cursor-not-allowed'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                        disabled={!isSelected && selectedCount >= 5}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{habit.name}</p>
                            {habit.description && (
                              <p className="text-xs text-gray-400">{habit.description}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            habit.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            habit.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {habit.difficulty}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('duration')}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium"
              >
                ← Back
              </button>
              <button
                onClick={() => selectedCount >= 1 && setStep('confirm')}
                disabled={selectedCount < 1}
                className="flex-[2] bg-purple-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-2xl font-bold"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Confirm Your Sprint</h2>

            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-xl p-2">
                  <span className="text-purple-600 font-black text-lg">{selectedDuration}d</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {DURATIONS.find((d) => d.days === selectedDuration)?.label} Sprint
                  </p>
                  <p className="text-sm text-gray-500">
                    {DURATIONS.find((d) => d.days === selectedDuration)?.desc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedHabits.map((habitId, i) => {
                  if (!habitId) return null
                  const habit = habits.find((h) => h.id === habitId)
                  if (!habit) return null
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-purple-50">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < 3 ? 'bg-purple-600 text-white' : 'bg-purple-300 text-white'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{habit.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-100">
              <p className="text-sm text-purple-800 font-medium mb-1">Your commitment</p>
              <p className="text-xs text-purple-600">
                You&apos;re committing to showing up for {selectedDuration} days straight.
                Not perfectly — consistently. That&apos;s how identity changes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('habits')}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] bg-purple-600 text-white py-3 rounded-2xl font-bold"
              >
                {saving ? 'Starting...' : "Let's Go! 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
