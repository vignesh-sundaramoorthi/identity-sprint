'use client'

import { useEffect, useState } from 'react'

interface ChallengeRow {
  id: number
  token: string
  user_email: string
  user_name: string | null
  duration_days: number
  start_date: string
  status: string
  dayNumber: number
  completedDays: number
  adherencePct: number
  trackerUrl: string
  habit_1?: { name: string } | null
  habit_2?: { name: string } | null
  habit_3?: { name: string } | null
  habit_4?: { name: string } | null
  habit_5?: { name: string } | null
}

interface Habit {
  id: number
  name: string
  domain_id: number | null
}

const EMPTY_FORM = {
  user_email: '',
  user_name: '',
  duration_days: 30,
  start_date: new Date().toISOString().split('T')[0],
  habit_1_id: '',
  habit_2_id: '',
  habit_3_id: '',
  habit_4_id: '',
  habit_5_id: '',
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [cRes, hRes] = await Promise.all([
      fetch('/api/admin/challenges'),
      fetch('/api/admin/habits'),
    ])
    const cData = await cRes.json()
    const hData = await hRes.json()
    setChallenges(Array.isArray(cData) ? cData : [])
    setHabits(hData.habits ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.user_email || !form.duration_days || !form.start_date) {
      setError('Email, duration, and start date are required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          habit_1_id: form.habit_1_id ? Number(form.habit_1_id) : null,
          habit_2_id: form.habit_2_id ? Number(form.habit_2_id) : null,
          habit_3_id: form.habit_3_id ? Number(form.habit_3_id) : null,
          habit_4_id: form.habit_4_id ? Number(form.habit_4_id) : null,
          habit_5_id: form.habit_5_id ? Number(form.habit_5_id) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewToken(data.token)
      setForm(EMPTY_FORM)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create challenge')
    } finally {
      setCreating(false)
    }
  }

  const statusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      paused: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status as keyof typeof colors] ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Challenges</h1>
            <p className="text-gray-500 text-sm mt-1">{challenges.length} active challenges</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin" className="text-gray-500 hover:text-gray-700 text-sm py-2 px-4">
              ← Admin Home
            </a>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              + New Challenge
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Create New Challenge</h2>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>
            )}
            {newToken && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-700 font-medium text-sm">✅ Challenge created!</p>
                <p className="text-green-600 text-xs mt-1 break-all">
                  Token: <code className="font-mono">{newToken}</code>
                </p>
                <p className="text-green-600 text-xs">
                  Tracker link:{' '}
                  <a
                    href={`/tracker/${newToken}`}
                    target="_blank"
                    className="underline"
                  >
                    /tracker/{newToken}
                  </a>
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Onboarding link (send to participant first):{' '}
                  <a
                    href={`/tracker/${newToken}/onboarding`}
                    target="_blank"
                    className="underline"
                  >
                    /tracker/{newToken}/onboarding
                  </a>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">User Email *</label>
                <input
                  type="email"
                  value={form.user_email}
                  onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  placeholder="user@example.com"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">User Name</label>
                <input
                  type="text"
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration *</label>
                <select
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value={21}>21 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={66}>66 Days</option>
                  <option value={100}>100 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Habit selectors */}
              {[1, 2, 3, 4, 5].map((slot) => {
                const key = `habit_${slot}_id` as keyof typeof form
                return (
                  <div key={slot} className={slot <= 3 ? '' : ''}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Habit {slot} {slot <= 3 ? '(Primary)' : '(Additional)'}
                    </label>
                    <select
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="">— None —</option>
                      {habits.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowCreate(false); setNewToken(null); setError(null) }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-[2] bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:bg-purple-400"
              >
                {creating ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </div>
        )}

        {/* Challenge list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No challenges yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 truncate">
                        {c.user_name ?? c.user_email}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.user_email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {c.duration_days}-day · Day {c.dayNumber}
                      </span>
                      <span className="text-xs font-medium text-purple-600">
                        {c.completedDays} days done · {c.adherencePct}% adherence
                      </span>
                    </div>
                    {/* Adherence bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${c.adherencePct >= 60 ? 'bg-purple-500' : 'bg-orange-400'}`}
                        style={{ width: `${c.adherencePct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <a
                      href={c.trackerUrl}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-700 text-xs font-medium block mb-1"
                    >
                      View Tracker →
                    </a>
                    <a
                      href={`/tracker/${c.token}/onboarding`}
                      target="_blank"
                      className="text-stone-500 hover:text-stone-700 text-xs font-medium block mb-1"
                    >
                      Onboarding →
                    </a>
                    <a
                      href={`/tracker/${c.token}/identity-checkin`}
                      target="_blank"
                      className="text-stone-500 hover:text-stone-700 text-xs font-medium block mb-1"
                    >
                      Identity check-in →
                    </a>
                    <p className="text-xs text-gray-300 font-mono">{c.token}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
