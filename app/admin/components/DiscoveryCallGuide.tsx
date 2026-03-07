'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Discovery Call Guide — Admin Component
// Phase 2 Improvement | Personalised 3-habit recommendations
//
// Changes from Phase 2:
//   1. Shows 3 ranked habit recommendations per matched domain
//   2. Only renders tabs for matched domain(s) — not all 7
//   3. Surfaces applicant's own words alongside the guide
//   4. Coach feedback after habit assignment (helpful/not_helpful/custom)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
  HABIT_LIBRARY,
  getDomainHabits,
  inferTopDomainsFromGoal,
  type Domain,
  type HabitEntry,
} from '@/lib/habitLibrary'

type Props = {
  applicationId: number
  identityGoal: string
  currentHabitRec?: string | null
  currentHabitFeedback?: string | null
  currentHabitCustom?: string | null
  // Applicant's own words to surface alongside
  dmIdentityVerbatim?: string | null
  whyNow?: string | null
  triedBefore?: string | null
}

export default function DiscoveryCallGuide({
  applicationId,
  identityGoal,
  currentHabitRec,
  currentHabitFeedback,
  currentHabitCustom,
  dmIdentityVerbatim,
  whyNow,
  triedBefore,
}: Props) {
  const matchedDomains = inferTopDomainsFromGoal(identityGoal)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(
    matchedDomains[0] ?? null
  )
  const [selectedHabit, setSelectedHabit] = useState<HabitEntry | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Assign state
  const [habitRec, setHabitRec] = useState(currentHabitRec ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Feedback state
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | 'custom' | ''>(
    (currentHabitFeedback as 'helpful' | 'not_helpful' | 'custom') ?? ''
  )
  const [customText, setCustomText] = useState(currentHabitCustom ?? '')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)

  const habits = selectedDomain ? getDomainHabits(selectedDomain) : []
  const displayHabit = selectedHabit ?? (habits[0] ?? null)

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  async function saveHabitRecommendation(name: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/applications/habit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, habit_recommendation: name }),
      })
      if (res.ok) {
        setHabitRec(name)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      /* no-op */
    } finally {
      setSaving(false)
    }
  }

  async function saveFeedback(
    fb: 'helpful' | 'not_helpful' | 'custom',
    custom?: string
  ) {
    setSavingFeedback(true)
    try {
      const res = await fetch('/api/admin/applications/habit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          habit_recommendation_feedback: fb,
          habit_recommendation_custom: custom ?? null,
        }),
      })
      if (res.ok) {
        setFeedback(fb)
        setSavedFeedback(true)
        setTimeout(() => setSavedFeedback(false), 3000)
      }
    } catch {
      /* no-op */
    } finally {
      setSavingFeedback(false)
    }
  }

  return (
    <div className="border-t border-gray-100 pt-5 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            📞 Discovery Call Guide
          </p>
          <p className="text-xs text-gray-400 mt-0.5 italic">
            3 habit recommendations ranked by fit. Pick the one that matches this
            person.
          </p>
        </div>
        {habitRec && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <span className="text-green-700 text-xs font-bold">💊 Assigned:</span>
            <span className="text-green-800 text-xs font-semibold">{habitRec}</span>
          </div>
        )}
      </div>

      {/* ── Layout: two-column on wider screens ── */}
      <div className="flex gap-4 items-start">
        {/* ── Left: Applicant's own words ── */}
        <div className="w-72 shrink-0 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Their Words
          </p>

          {dmIdentityVerbatim && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Identity in their words
              </p>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &ldquo;{dmIdentityVerbatim}&rdquo;
              </p>
            </div>
          )}

          {identityGoal && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Identity goal (application)
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {identityGoal}
              </p>
            </div>
          )}

          {whyNow && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Why now
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{whyNow}</p>
            </div>
          )}

          {triedBefore && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                Tried before
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                {triedBefore}
              </p>
            </div>
          )}

          {!dmIdentityVerbatim && !whyNow && !triedBefore && (
            <p className="text-xs text-gray-400 italic">
              No verbatim answers captured yet.
            </p>
          )}
        </div>

        {/* ── Right: Guide ── */}
        <div className="flex-1 min-w-0">
          {/* Domain tabs — only matched domains */}
          {matchedDomains.length > 0 ? (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Matched domain{matchedDomains.length > 1 ? 's' : ''}
                <span className="ml-2 text-purple-600 font-normal">
                  (inferred from identity goal)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedDomains.map((domain) => {
                  const lib = HABIT_LIBRARY[domain][0]
                  const isSelected = selectedDomain === domain
                  return (
                    <button
                      key={domain}
                      onClick={() => {
                        setSelectedDomain(isSelected ? null : domain)
                        setSelectedHabit(null)
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {lib.domainEmoji} {lib.domainLabel}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-semibold">
                ⚠️ No domain inferred from identity goal.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Review the applicant&apos;s answers manually before the call.
              </p>
            </div>
          )}

          {/* 3-habit picker */}
          {selectedDomain && habits.length > 0 && (
            <div className="mb-3 flex gap-2">
              {habits.map((h, i) => (
                <button
                  key={h.habitName}
                  onClick={() => setSelectedHabit(h)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-left transition ${
                    displayHabit?.habitName === h.habitName
                      ? 'bg-indigo-50 border-indigo-400'
                      : 'bg-white border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <p className="text-xs font-bold text-indigo-400 mb-0.5">
                    {i === 0 ? '★ Best fit' : i === 1 ? '2nd option' : '3rd option'}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {h.habitName}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Habit card */}
          {displayHabit && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
              {/* Habit name */}
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                  GATEWAY HABIT
                </p>
                <p className="text-xl font-extrabold text-indigo-900">
                  {displayHabit.habitName}
                </p>
              </div>

              {/* Identity anchor */}
              <div className="bg-indigo-600 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">
                  🎯 IDENTITY ANCHOR — say this first
                </p>
                <p className="text-sm text-white font-medium leading-relaxed">
                  {displayHabit.identityAnchor}
                </p>
              </div>

              {/* Why it works */}
              <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                <button
                  onClick={() => toggle('why')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    WHY IT WORKS (say this on the call)
                  </p>
                  <span className="text-gray-400 text-sm">
                    {expanded['why'] === false ? '▼' : '▲'}
                  </span>
                </button>
                {expanded['why'] !== false && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-800 leading-relaxed italic">
                      {displayHabit.whyItWorks}
                    </p>
                  </div>
                )}
              </div>

              {/* Week 1 minimum */}
              <div className="bg-white rounded-xl border border-indigo-100 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  WEEK 1 MINIMUM
                </p>
                <p className="text-sm text-gray-800">{displayHabit.week1Minimum}</p>
              </div>

              {/* Watch for */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">
                  WATCH FOR
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {displayHabit.watchFor}
                </p>
              </div>

              {/* Sequencing note */}
              {displayHabit.sequencingNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                    SEQUENCING NOTE
                  </p>
                  <p className="text-sm text-blue-900">{displayHabit.sequencingNote}</p>
                </div>
              )}

              {/* Assign button */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => saveHabitRecommendation(displayHabit.habitName)}
                  disabled={saving || habitRec === displayHabit.habitName}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                    habitRec === displayHabit.habitName
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50`}
                >
                  {saving
                    ? 'Saving...'
                    : habitRec === displayHabit.habitName
                    ? '✓ Assigned'
                    : `Assign: ${displayHabit.habitName}`}
                </button>
                {saved && (
                  <span className="text-green-600 text-sm font-semibold animate-pulse">
                    Saved ✓
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Coach feedback — only show after a habit is assigned ── */}
          {habitRec && (
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Was this suggestion helpful for the discovery call?
              </p>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { key: 'helpful', label: '👍 Yes' },
                    { key: 'not_helpful', label: '👎 No' },
                    { key: 'custom', label: '✏️ I used something different' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFeedback(key)
                      if (key !== 'custom') saveFeedback(key)
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                      feedback === key
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom text input */}
              {feedback === 'custom' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="What habit did you use instead?"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => saveFeedback('custom', customText)}
                    disabled={savingFeedback || !customText.trim()}
                    className="mt-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingFeedback ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {savedFeedback && (
                <p className="text-green-600 text-xs font-semibold mt-2 animate-pulse">
                  Feedback saved ✓
                </p>
              )}
            </div>
          )}

          {!selectedDomain && matchedDomains.length > 0 && (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-400 text-sm">
                Select a domain above to see habit recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
