'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Discovery Call Guide — Admin Component
// Phase 2 | Craft H82 verbatim copy | Flux Integration Spec H81
//
// Vignesh uses this DURING the 30-min discovery call:
//   Step 1: Domain auto-inferred from identity_goal (editable)
//   Step 2: Gateway habit card surfaces — scannable in 10 seconds
//   Step 3: Vignesh selects habit → writes to applications.habit_recommendation
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { HABIT_LIBRARY, DOMAIN_ORDER, inferDomainFromGoal, type Domain } from '@/lib/habitLibrary'

type Props = {
  applicationId: number
  identityGoal: string
  currentHabitRec?: string | null
}

export default function DiscoveryCallGuide({ applicationId, identityGoal, currentHabitRec }: Props) {
  const inferredDomain = inferDomainFromGoal(identityGoal)
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(inferredDomain)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [habitRec, setHabitRec] = useState(currentHabitRec ?? '')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const habit = selectedDomain ? HABIT_LIBRARY[selectedDomain] : null

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
    } catch { /* no-op */ }
    finally { setSaving(false) }
  }

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="border-t border-gray-100 pt-5 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">📞 Discovery Call Guide</p>
          <p className="text-xs text-gray-400 mt-0.5 italic">
            You&apos;ve already read their application. This tool helps you scope the one habit to start with.
          </p>
        </div>
        {habitRec && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <span className="text-green-700 text-xs font-bold">💊 Assigned:</span>
            <span className="text-green-800 text-xs font-semibold">{habitRec}</span>
          </div>
        )}
      </div>

      {/* Domain selector */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          Select domain
          {inferredDomain && (
            <span className="ml-2 text-purple-600 font-normal">(inferred from identity goal)</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_ORDER.map((domain) => {
            const h = HABIT_LIBRARY[domain]
            const isSelected = selectedDomain === domain
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(isSelected ? null : domain)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {h.domainEmoji} {h.domainLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* Habit card */}
      {habit && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
          {/* Habit name */}
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">GATEWAY HABIT</p>
            <p className="text-xl font-extrabold text-indigo-900">{habit.habitName}</p>
          </div>

          {/* Identity anchor — highlighted, most important */}
          <div className="bg-indigo-600 rounded-xl p-4">
            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">
              🎯 IDENTITY ANCHOR — say this first
            </p>
            <p className="text-sm text-white font-medium leading-relaxed">{habit.identityAnchor}</p>
          </div>

          {/* Why it works — collapsible */}
          <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
            <button
              onClick={() => toggle('why')}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                WHY IT WORKS (say this on the call)
              </p>
              <span className="text-gray-400 text-sm">{expanded['why'] ? '▲' : '▼'}</span>
            </button>
            {expanded['why'] !== false && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-800 leading-relaxed italic">{habit.whyItWorks}</p>
              </div>
            )}
          </div>

          {/* Week 1 minimum */}
          <div className="bg-white rounded-xl border border-indigo-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">WEEK 1 MINIMUM</p>
            <p className="text-sm text-gray-800">{habit.week1Minimum}</p>
          </div>

          {/* Watch for */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">WATCH FOR</p>
            <p className="text-sm text-amber-900 leading-relaxed">{habit.watchFor}</p>
          </div>

          {/* Sequencing note */}
          {habit.sequencingNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1.5">SEQUENCING NOTE</p>
              <p className="text-sm text-blue-900">{habit.sequencingNote}</p>
            </div>
          )}

          {/* Assign button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => saveHabitRecommendation(habit.habitName)}
              disabled={saving || habitRec === habit.habitName}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
                habitRec === habit.habitName
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-50`}
            >
              {saving ? 'Saving...' : habitRec === habit.habitName ? '✓ Assigned' : `Assign: ${habit.habitName}`}
            </button>
            {saved && (
              <span className="text-green-600 text-sm font-semibold animate-pulse">Saved ✓</span>
            )}
          </div>
        </div>
      )}

      {!selectedDomain && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">Select a domain above to see the gateway habit card.</p>
        </div>
      )}
    </div>
  )
}
