'use client'

import { useEffect, useState } from 'react'

interface Domain {
  id: number
  name: string
  emoji: string | null
}

interface Habit {
  id: number
  domain_id: number | null
  name: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  simpler_version: string | null
  habit_domains?: { name: string; emoji: string | null }
}

type Difficulty = 'easy' | 'medium' | 'hard'

const EMPTY_HABIT: {
  name: string
  description: string
  difficulty: Difficulty
  domain_id: string
  simpler_version: string
} = {
  name: '',
  description: '',
  difficulty: 'medium',
  domain_id: '',
  simpler_version: '',
}

export default function AdminHabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDomain, setActiveDomain] = useState<number | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const [form, setForm] = useState<typeof EMPTY_HABIT>(EMPTY_HABIT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/habits')
    const data = await res.json()
    setHabits(data.habits ?? [])
    setDomains(data.domains ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditHabit(null)
    setForm(EMPTY_HABIT)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (habit: Habit) => {
    setEditHabit(habit)
    setForm({
      name: habit.name,
      description: habit.description ?? '',
      difficulty: habit.difficulty as Difficulty,
      domain_id: habit.domain_id?.toString() ?? '',
      simpler_version: habit.simpler_version ?? '',
    })
    setError(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        difficulty: form.difficulty,
        domain_id: form.domain_id ? Number(form.domain_id) : null,
        simpler_version: form.simpler_version || null,
      }

      const res = editHabit
        ? await fetch('/api/admin/habits', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editHabit.id, ...payload }),
          })
        : await fetch('/api/admin/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setShowForm(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this habit? This cannot be undone.')) return
    await fetch(`/api/admin/habits?id=${id}`, { method: 'DELETE' })
    await load()
  }

  const filteredHabits = activeDomain === 'all'
    ? habits
    : habits.filter((h) => h.domain_id === activeDomain)

  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Habit Library</h1>
            <p className="text-gray-500 text-sm mt-1">{habits.length} habits across {domains.length} domains</p>
          </div>
          <div className="flex gap-3">
            <a href="/admin" className="text-gray-500 hover:text-gray-700 text-sm py-2 px-4">
              ← Admin Home
            </a>
            <button
              onClick={openCreate}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              + Add Habit
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="font-black text-gray-900 text-lg mb-4">
                {editHabit ? 'Edit Habit' : 'New Habit'}
              </h2>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    placeholder="e.g. Morning walk (20 min)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    placeholder="Brief description for users"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
                    <select
                      value={form.domain_id}
                      onChange={(e) => setForm({ ...form, domain_id: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="">— None —</option>
                      {domains.map((d) => (
                        <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Simpler Version <span className="text-gray-400">(adaptive fallback)</span>
                  </label>
                  <input
                    type="text"
                    value={form.simpler_version}
                    onChange={(e) => setForm({ ...form, simpler_version: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    placeholder="e.g. 10-min stroll outside"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:bg-purple-400"
                >
                  {saving ? 'Saving...' : editHabit ? 'Update Habit' : 'Add Habit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Domain filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setActiveDomain('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeDomain === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All ({habits.length})
          </button>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDomain(d.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeDomain === d.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {d.emoji} {d.name} ({habits.filter((h) => h.domain_id === d.id).length})
            </button>
          ))}
        </div>

        {/* Habits list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading habits...</div>
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No habits yet.</div>
        ) : (
          <div className="space-y-2">
            {filteredHabits.map((habit) => (
              <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{habit.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[habit.difficulty]}`}>
                        {habit.difficulty}
                      </span>
                    </div>
                    {habit.description && (
                      <p className="text-xs text-gray-500 mb-1">{habit.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {habit.habit_domains && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {habit.habit_domains.emoji} {habit.habit_domains.name}
                        </span>
                      )}
                      {habit.simpler_version && (
                        <span className="text-xs text-gray-400">→ {habit.simpler_version}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(habit)}
                      className="text-gray-400 hover:text-purple-600 text-sm px-2 py-1 rounded-lg hover:bg-purple-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-gray-300 hover:text-red-500 text-sm px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      ×
                    </button>
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
