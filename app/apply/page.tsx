'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateBlueprint, CRAVING_LABELS, FAILURE_LABELS, type HabitBlueprint } from '@/lib/assessment'

type AppForm = {
  name: string; email: string; whatsapp: string
  identity_goal: string; tried_before: string; why_now: string; commitment: string
}

type QuizForm = { q1: string; q2: string; q3: string; q4: string; q5: string; q6: string }

const QUIZ_QUESTIONS = [
  {
    key: 'q1', question: 'What do you feel you need MOST right now?',
    options: ['To feel appreciated / respected', 'To feel more in control of my life', 'To learn useful skills & improve', 'To feel supported by people', 'To bring more excitement into life'],
  },
  {
    key: 'q2', question: 'What usually blocks your progress the most?',
    options: ['Feeling bored or uninspired', 'Feeling not good enough yet', 'Feeling alone in the journey', 'Feeling undervalued / unnoticed', 'Life feels messy or out of control'],
  },
  {
    key: 'q3', question: 'What keeps you going when things get hard?',
    options: ['Being recognised for results', 'Clear steps and structure', 'Trying something new', 'Doing it with someone', 'Getting better at a skill'],
  },
  {
    key: 'q4', question: 'What kind of activities energise you most?',
    options: ['Planning, organising, routines', 'New experiences / variety', 'Skill practice & improvement', 'Community / group vibe', 'Winning, achievement, being seen'],
  },
  {
    key: 'q5', question: 'What would make this journey feel truly successful for you?',
    options: ['Feeling stable and consistent', 'Feeling proud of a skill I built', 'Feeling supported throughout', 'Feeling excited and alive again', 'Feeling recognised for my growth', 'Actually following through — consistently doing what I say I will'],
  },
  {
    key: 'q6', question: 'Why weren\'t previous attempts at change successful?',
    options: [
      'I relied on motivation — it worked until I stopped feeling like it',
      'I started too big and got overwhelmed',
      'My environment made it too hard to stay consistent',
      'I didn\'t see results fast enough and lost interest',
      'Life got busy and I never built it into my routine properly',
      'The people around me didn\'t support it',
      'I never really believed I was the kind of person who could do it',
    ],
  },
]

const CRAVING_EMOJIS: Record<string, string> = {
  stability: '🏛️', novelty: '⚡', connection: '🤝',
  recognition: '🏆', competence: '🧠', autonomy: '🎯',
}

const FAILURE_EMOJIS: Record<string, string> = {
  no_identity_anchor: '🪞', willpower_reliance: '💪',
  environment_not_designed: '🏠', habit_too_big: '🏔️',
  no_immediate_reward: '⏳', vague_intention: '🌫️', social_environment: '👥',
}

export default function Apply() {
  const [step, setStep] = useState<'form' | 'quiz' | 'results' | 'done'>('form')
  const [loading, setLoading] = useState(false)
  const [applicantName, setApplicantName] = useState('')
  const [blueprint, setBlueprint] = useState<HabitBlueprint | null>(null)

  const [form, setForm] = useState<AppForm>({
    name: '', email: '', whatsapp: '', identity_goal: '', tried_before: '', why_now: '', commitment: '',
  })
  const [quiz, setQuiz] = useState<QuizForm>({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) { setApplicantName(form.name.split(' ')[0]); setStep('quiz'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    } catch { alert('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Generate blueprint client-side
    const bp = generateBlueprint({ q1: quiz.q1, q2: quiz.q2, q3: quiz.q3, q4: quiz.q4, q5: quiz.q5 }, quiz.q6)
    setBlueprint(bp)
    // Save to DB (non-blocking)
    fetch('/api/discovery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email, name: form.name, ...quiz,
        primary_craving: bp.cravingProfile.primary,
        secondary_craving: bp.cravingProfile.secondary,
        primary_failure: bp.failureProfile.primary,
      }),
    }).catch(() => {})
    setLoading(false)
    setStep('done')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ─── RESULTS PAGE ────────────────────────────────────────────────────────────
  if (step === 'results' && blueprint) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-12 pb-24">
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              🧬 Your Habit Blueprint
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              Here&apos;s how you&apos;re wired, {applicantName}
            </h1>
            <p className="text-gray-500">Based on your answers — personalized to you, grounded in behavioral science.</p>
          </div>

          {/* Headline insight */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6">
            <p className="text-xl font-bold leading-relaxed">&ldquo;{blueprint.headline}&rdquo;</p>
          </div>

          {/* Craving profile */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Your craving profile</h2>
            <div className="flex gap-3 flex-wrap mb-4">
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                {CRAVING_EMOJIS[blueprint.cravingProfile.primary]} Primary: {CRAVING_LABELS[blueprint.cravingProfile.primary]}
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                {CRAVING_EMOJIS[blueprint.cravingProfile.secondary]} Secondary: {CRAVING_LABELS[blueprint.cravingProfile.secondary]}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {blueprint.insight.replace(/\*\*/g, '')}
            </p>
          </div>

          {/* Why previous attempts failed */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3">Why it hasn&apos;t stuck before</h2>
            <div className="flex gap-2 flex-wrap mb-3">
              {blueprint.failureProfile.causes.map(c => (
                <span key={c} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {FAILURE_EMOJIS[c]} {FAILURE_LABELS[c]}
                </span>
              ))}
            </div>
            <p className="text-gray-700 text-sm">{blueprint.failureProfile.causes.length > 0 && Object.entries(FAILURE_LABELS).find(([k]) => k === blueprint.failureProfile.primary)?.[1] && `The fix: ${Object.entries({ no_identity_anchor: "Start with identity, not habits.", willpower_reliance: "Build systems — remove willpower from the equation.", environment_not_designed: "Redesign your environment before changing behaviour.", habit_too_big: "Start absurdly small. 2-minute rule first.", no_immediate_reward: "Wire in an immediate reward for every rep.", vague_intention: "Create a clear implementation intention: when X, I will Y.", social_environment: "Get your environment on your side, or find a new one." }).find(([k]) => k === blueprint.failureProfile.primary)?.[1]}`}</p>
          </div>

          {/* Design principles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Your habit design principles</h2>
            <ul className="space-y-3">
              {blueprint.designPrinciples.map((p, i) => (
                <li key={i} className="flex gap-3 text-gray-700 text-sm">
                  <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5 mb-8">
            <p className="text-sm text-red-800">
              <span className="font-semibold">⚠️ Watch out: </span>{blueprint.warning}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center bg-purple-600 rounded-2xl p-8 text-white">
            <p className="text-xl font-bold mb-2">This is just the starting point.</p>
            <p className="text-purple-200 mb-6 text-sm">In your discovery call, we&apos;ll use this blueprint to design your first 30 days.</p>
            <button onClick={() => { setStep('done'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="bg-white text-purple-700 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition">
              I&apos;m ready — confirm my application →
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ─── DONE ────────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">🙌</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">You&apos;re in, {applicantName}.</h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            I&apos;ve got your application and your blueprint. I&apos;ll reach out within 24 hours to book your discovery call.
          </p>
          <div className="bg-purple-50 rounded-2xl p-6 text-left mb-6">
            <p className="font-semibold text-gray-800 mb-3">What happens next:</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. I review your application + blueprint (same day)</li>
              <li>2. I message you to book a 30-min discovery call</li>
              <li>3. We build your first 30-day identity sprint together</li>
            </ol>
          </div>

          {/* Confirmation page callout — commitment half-life extension (Craft, pre-Cohort 1) */}
          <div className="border border-gray-200 rounded-2xl p-6 text-left mb-8 bg-gray-50">
            <p className="font-semibold text-gray-800 mb-3">One thing that will make your discovery call more useful:</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Write down the habit or change you&apos;ve tried the most times — and never made stick. Be specific.
            </p>
            <p className="text-gray-500 text-sm">You don&apos;t need to send it to us. It&apos;s for you. We&apos;ll start there.</p>
          </div>

          <Link href="/" className="text-purple-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </main>
    )
  }

  // ─── QUIZ ────────────────────────────────────────────────────────────────────
  if (step === 'quiz') {
    const allAnswered = Object.values(quiz).every(v => v !== '')
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="px-6 py-5 max-w-5xl mx-auto">
          <span className="text-gray-400 text-sm">Step 2 of 2 — Self Discovery</span>
        </nav>
        <div className="max-w-2xl mx-auto px-6 pb-24">
          <div className="text-center mb-10 pt-4">
            <div className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">✅ Application received!</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">How are you wired for change, {applicantName}?</h1>
            <p className="text-gray-500">6 questions. Then I&apos;ll show you your personalized Habit Blueprint — grounded in behavioral science.</p>
          </div>
          <form onSubmit={handleQuizSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
            {QUIZ_QUESTIONS.map((q, idx) => (
              <div key={q.key}>
                <p className="font-semibold text-gray-900 mb-4">
                  <span className="text-purple-600 font-bold">{idx + 1}.</span> {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option) => {
                    const selected = quiz[q.key as keyof QuizForm] === option
                    return (
                      <label key={option} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${selected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name={q.key} value={option} checked={selected}
                          onChange={() => setQuiz({ ...quiz, [q.key]: option })} className="accent-purple-600 w-4 h-4 flex-shrink-0" />
                        <span className={`text-sm ${selected ? 'text-purple-800 font-medium' : 'text-gray-600'}`}>{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="pt-2 space-y-3">
              <button type="submit" disabled={loading || !allAnswered}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-lg">
                {loading ? 'Generating your blueprint...' : 'Show me my Habit Blueprint →'}
              </button>
              <button type="button" onClick={() => setStep('done')} className="w-full text-gray-400 text-sm hover:text-gray-600 py-2">Skip for now</button>
            </div>
          </form>
        </div>
      </main>
    )
  }

  // ─── APPLICATION FORM ────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="px-6 py-5 max-w-5xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm font-medium">← Back</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center mb-10 pt-8">
          <div className="inline-block bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">🧬 2 free spots remaining</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Apply for Identity Sprint</h1>
          <p className="text-gray-500 text-lg">3 minutes. Then you&apos;ll get a personalized Habit Blueprint based on your answers.</p>
        </div>
        <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleFormChange} placeholder="Priya Sharma"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address *</label>
              <input type="email" name="email" required value={form.email} onChange={handleFormChange} placeholder="priya@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp number</label>
            <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleFormChange} placeholder="+91 98765 43210"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Who do you want to become? *</label>
            <p className="text-xs text-gray-400 mb-3">Not what habits. Who. &quot;The kind of person who...&quot;</p>
            <textarea name="identity_goal" required value={form.identity_goal} onChange={handleFormChange} rows={4}
              placeholder="e.g. The kind of person who works out consistently without it feeling like a chore..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What have you already tried? *</label>
            <textarea name="tried_before" required value={form.tried_before} onChange={handleFormChange} rows={3}
              placeholder="e.g. Tried Habitica, a gym trainer for 3 months..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Why now? *</label>
            <textarea name="why_now" required value={form.why_now} onChange={handleFormChange} rows={2}
              placeholder="e.g. Just turned 30. Realized I've been saying 'I'll start Monday' for two years..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Can you commit 30 min/week for 4 weeks? *</label>
            <div className="flex flex-wrap gap-4">
              {['Yes, absolutely', 'Mostly — some weeks might be tight', 'Not sure'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="commitment" value={option} required onChange={handleFormChange} className="accent-purple-600" />
                  <span className="text-sm text-gray-600">{option}</span>
                </label>
              ))}
            </div>
            {form.commitment === 'Not sure' && (
              <p className="text-sm text-gray-500 mt-2 italic">
                If you&apos;re not sure, that&apos;s okay to be honest about. The discovery call is a good place to figure it out together.
              </p>
            )}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-60 shadow-lg">
              {loading ? 'Saving...' : 'Continue to Self Discovery →'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Next: 6 questions → get your personalized Habit Blueprint</p>
          </div>
        </form>
      </div>
    </main>
  )
}
