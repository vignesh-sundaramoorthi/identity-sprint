'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface OnboardingData {
  challenge: { id: number; user_name: string; status: string }
  identity_goal: string | null
  declaration: { id: number; declaration: string; created_at: string } | null
}

type PageState = 'loading' | 'error' | 'ready' | 'submitting' | 'success'

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [data, setData] = useState<OnboardingData | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [declaration, setDeclaration] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch(`/api/tracker/${token}/onboarding`)
      .then((r) => r.json())
      .then((d: OnboardingData & { error?: string }) => {
        if (d.error) {
          setPageState('error')
          return
        }
        setData(d)
        // If already declared, show success state
        if (d.declaration) {
          setDeclaration(d.declaration.declaration)
          setPageState('success')
        } else {
          setPageState('ready')
        }
      })
      .catch(() => setPageState('error'))
  }, [token])

  const handleSubmit = async () => {
    if (!declaration.trim() || declaration.trim().length < 5) {
      setErrorMsg('Write something — even a few words. There are no wrong answers.')
      return
    }
    setErrorMsg('')
    setPageState('submitting')

    try {
      const res = await fetch(`/api/tracker/${token}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declaration: declaration.trim() }),
      })

      if (!res.ok) throw new Error('Save failed')

      // Small pause for gravity
      await new Promise((r) => setTimeout(r, 1200))
      setPageState('success')
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
          <p className="text-gray-500 text-sm">Check your email for the correct link, or contact Vignesh.</p>
        </div>
      </div>
    )
  }

  // Success state — declaration set
  if (pageState === 'success') {
    const fullDeclaration = declaration.toLowerCase().startsWith('i am becoming')
      ? declaration
      : `I am becoming ${declaration}`

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your declaration is set.</h1>
            <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 text-left">
              <p className="text-stone-800 text-lg leading-relaxed font-medium italic">
                &ldquo;{fullDeclaration}&rdquo;
              </p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              We&apos;ll remind you of this every week.
            </p>
          </div>

          <button
            onClick={() => router.push(`/tracker/${token}`)}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white py-4 rounded-2xl font-semibold transition-colors"
          >
            Go to your tracker →
          </button>
        </div>
      </div>
    )
  }

  const identityGoal = data?.identity_goal
  const name = data?.challenge?.user_name ?? 'there'

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <p className="text-stone-400 text-sm uppercase tracking-widest mb-6">Before we begin</p>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Hey {name}.
          </h1>
          <p className="text-gray-600 leading-relaxed">
            You wrote this when you applied:
          </p>
        </div>

        {/* Identity Goal Mirror */}
        {identityGoal && (
          <div className="bg-white border-l-4 border-stone-700 rounded-r-2xl pl-5 pr-6 py-5 mb-10">
            <p className="text-stone-800 text-lg leading-relaxed font-medium">
              &ldquo;{identityGoal}&rdquo;
            </p>
          </div>
        )}

        {/* Transition copy */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-base">
            Now it&apos;s time to commit to it. Not as a goal — as a statement of who you&apos;re becoming.
          </p>
        </div>

        {/* Declaration input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Write your identity declaration:
          </label>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden focus-within:border-stone-500 transition-colors">
            {/* Prefix */}
            <div className="px-4 pt-4 pb-1">
              <p className="text-stone-400 text-sm font-medium">I am becoming...</p>
            </div>
            <textarea
              value={declaration}
              onChange={(e) => {
                setDeclaration(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              placeholder="the person who..."
              rows={3}
              className="w-full px-4 pb-4 text-base text-stone-900 placeholder-stone-300 focus:outline-none resize-none bg-transparent"
              maxLength={500}
            />
          </div>

          {/* Helper text */}
          <p className="text-stone-400 text-xs mt-2 leading-relaxed">
            There are no wrong answers. Write what&apos;s true for you right now.
          </p>

          {errorMsg && (
            <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={pageState === 'submitting'}
          className="w-full bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white py-4 rounded-2xl font-semibold text-base transition-colors"
        >
          {pageState === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Setting your declaration...
            </span>
          ) : (
            'This is who I\'m becoming →'
          )}
        </button>
      </div>
    </div>
  )
}
