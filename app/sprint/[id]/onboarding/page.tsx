'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Application {
  id: number
  name: string
  identity_goal: string
  identity_declaration: string | null
}

export default function OnboardingPage() {
  const params = useParams()
  const id = params.id as string

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // Declaration input
  const [declaration, setDeclaration] = useState('')

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/sprint/${id}/onboarding`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Not found')
        return
      }
      const data = await res.json()
      setApplication(data.application)
      // Pre-fill if they already declared
      if (data.application.identity_declaration) {
        setDeclaration(data.application.identity_declaration)
      }
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
    if (!declaration.trim() || declaration.trim().length < 5) return
    setSaving(true)
    try {
      const res = await fetch(`/api/sprint/${id}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_declaration: declaration.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Failed to save. Please try again.')
        return
      }

      setDone(true)
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Error
  if (error || !application) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-white text-xl font-semibold mb-2">Sprint not found</p>
          <p className="text-stone-400 text-sm">{error ?? 'Your link may be incorrect.'}</p>
        </div>
      </div>
    )
  }

  // Success state — declaration made
  if (done || application.identity_declaration) {
    const shownDeclaration = done ? declaration : application.identity_declaration
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center">

          {/* Flame / affirmation icon */}
          <div className="text-5xl mb-6">🔥</div>

          {/* Success microcopy — Craft-approved */}
          <h1 className="text-white text-2xl font-black mb-3 leading-tight">
            Your identity sprint starts now.
          </h1>
          <p className="text-stone-400 text-base mb-10">
            You know who you&apos;re becoming.
          </p>

          {/* The declaration itself */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-8 text-left">
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">Your declaration</p>
            <p className="text-white text-lg font-bold leading-snug">
              {shownDeclaration}
            </p>
          </div>

          {/* Next step nudge */}
          <p className="text-stone-500 text-sm">
            Your first weekly check-in will be available after Week 1.
            <br />
            Watch for Vignesh&apos;s message on WhatsApp.
          </p>
        </div>
      </div>
    )
  }

  // Main onboarding / declaration form
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-start p-6 pt-12">
      <div className="w-full max-w-md">

        {/* Header badge */}
        <div className="flex justify-center mb-8">
          <span className="text-xs font-semibold text-stone-400 border border-stone-700 rounded-full px-4 py-1 uppercase tracking-widest">
            Identity Sprint · Onboarding
          </span>
        </div>

        {/* Their goal — shown for context */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-8">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">You applied to become</p>
          <p className="text-white text-base leading-relaxed font-medium">"{application.identity_goal}"</p>
        </div>

        {/* Craft-approved screen header */}
        <h1 className="text-white text-3xl font-black mb-3 leading-tight">
          This is your declaration.
        </h1>
        <p className="text-stone-400 text-base mb-8 leading-relaxed">
          Not a goal. Not a wish. A statement of who you are becoming — written in your words, on your terms.
        </p>

        {/* Declaration input */}
        <div className="mb-2">
          <textarea
            value={declaration}
            onChange={(e) => setDeclaration(e.target.value)}
            // Craft-approved placeholder
            placeholder="I am becoming the kind of person who..."
            rows={5}
            className="w-full bg-stone-900 border border-stone-700 text-white placeholder-stone-600 rounded-xl p-4 text-base resize-none focus:outline-none focus:border-stone-400 transition-colors leading-relaxed font-medium"
          />
        </div>
        <p className="text-stone-600 text-xs mb-8 pl-1">
          Write this for yourself. Make it specific. Make it true.
        </p>

        {/* Submit — Craft-approved button text */}
        <button
          onClick={handleSubmit}
          disabled={saving || declaration.trim().length < 5}
          className="w-full bg-white text-stone-950 font-black py-4 rounded-2xl text-base transition-all hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed mb-3"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
              Declaring...
            </span>
          ) : (
            // Craft-approved: "I declare this. Let's begin."
            'I declare this. Let\'s begin.'
          )}
        </button>

        <p className="text-stone-600 text-xs text-center">
          You can update this during your sprint if it evolves.
        </p>
      </div>
    </div>
  )
}
