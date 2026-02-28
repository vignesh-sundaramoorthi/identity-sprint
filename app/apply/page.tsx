'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Step 1: Application form state ───────────────────────────────────────────
type AppForm = {
  name: string
  email: string
  whatsapp: string
  identity_goal: string
  tried_before: string
  why_now: string
  commitment: string
}

// ─── Step 2: Self Discovery quiz state ────────────────────────────────────────
type QuizForm = {
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
}

const QUIZ_QUESTIONS = [
  {
    key: 'q1',
    question: 'What do you feel you need MOST right now?',
    options: [
      'To feel appreciated / respected',
      'To feel more in control of my life',
      'To learn useful skills & improve',
      'To feel supported by people',
      'To bring more excitement into life',
    ],
  },
  {
    key: 'q2',
    question: 'What usually blocks your progress the most?',
    options: [
      'Feeling bored or uninspired',
      'Feeling not good enough yet',
      'Feeling alone in the journey',
      'Feeling undervalued / unnoticed',
      'Life feels messy or out of control',
    ],
  },
  {
    key: 'q3',
    question: 'What pushes you to take action?',
    options: [
      'Being recognised for results',
      'Clear steps and structure',
      'Trying something new',
      'Doing it with someone',
      'Getting better at a skill',
    ],
  },
  {
    key: 'q4',
    question: 'What kind of activities energise you most?',
    options: [
      'Planning, organising, routines',
      'New experiences / variety',
      'Skill practice & improvement',
      'Community / group vibe',
      'Winning, achievement, being seen',
    ],
  },
  {
    key: 'q5',
    question: 'What would make this journey feel truly successful for you?',
    options: [
      'Feeling stable and consistent',
      'Feeling proud of a skill I built',
      'Feeling supported throughout',
      'Feeling excited and alive again',
      'Feeling recognised for my growth',
    ],
  },
]

export default function Apply() {
  const [step, setStep] = useState<'form' | 'quiz' | 'done'>('form')
  const [loading, setLoading] = useState(false)
  const [applicantName, setApplicantName] = useState('')

  const [form, setForm] = useState<AppForm>({
    name: '',
    email: '',
    whatsapp: '',
    identity_goal: '',
    tried_before: '',
    why_now: '',
    commitment: '',
  })

  const [quiz, setQuiz] = useState<QuizForm>({
    q1: '', q2: '', q3: '', q4: '', q5: '',
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleQuizChange = (key: string, value: string) => {
    setQuiz({ ...quiz, [key]: value })
  }

  // Step 1 submit — save application
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setApplicantName(form.name.split(' ')[0])
        setStep('quiz')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 submit — save quiz answers
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name, ...quiz }),
      })
    } catch {
      // Non-blocking — proceed even if this fails
    } finally {
      setLoading(false)
      setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ─── DONE STATE ─────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">🙌</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">You&apos;re in the queue, {applicantName}.</h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            I&apos;ve got everything I need. I&apos;ll reach out within 24 hours to see if we&apos;re a good fit and book your discovery call.
          </p>
          <div className="bg-purple-50 rounded-2xl p-6 text-left mb-8">
            <p className="font-semibold text-gray-800 mb-3">What happens next:</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. I read your application (usually same day)</li>
              <li>2. I&apos;ll message you to book a 30-min discovery call</li>
              <li>3. We figure out your identity target together</li>
              <li>4. Your sprint starts within the week</li>
            </ol>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            In the meantime — notice one moment today where you&apos;re acting from your old identity vs. who you want to become. That&apos;s the work.
          </p>
          <Link href="/" className="text-purple-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </main>
    )
  }

  // ─── QUIZ STATE (Step 2) ─────────────────────────────────────────────────────
  if (step === 'quiz') {
    const allAnswered = Object.values(quiz).every(v => v !== '')
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="px-6 py-5 max-w-5xl mx-auto">
          <span className="text-gray-400 text-sm font-medium">Step 2 of 2</span>
        </nav>
        <div className="max-w-2xl mx-auto px-6 pb-24">
          <div className="text-center mb-10 pt-4">
            <div className="inline-block bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              ✅ Application received!
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
              One more thing, {applicantName} 👋
            </h1>
            <p className="text-gray-500 text-lg">
              This 5-question quiz helps me understand how you&apos;re wired for change — so I can tailor your sprint from day one.
            </p>
          </div>

          <form onSubmit={handleQuizSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
            {QUIZ_QUESTIONS.map((q, idx) => (
              <div key={q.key}>
                <p className="font-semibold text-gray-900 mb-4">
                  <span className="text-purple-600 font-bold">{idx + 1}.</span> {q.question}
                </p>
                <div className="space-y-3">
                  {q.options.map((option) => {
                    const selected = quiz[q.key as keyof QuizForm] === option
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                          selected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={option}
                          checked={selected}
                          onChange={() => handleQuizChange(q.key, option)}
                          className="accent-purple-600 w-4 h-4 flex-shrink-0"
                        />
                        <span className={`text-sm ${selected ? 'text-purple-800 font-medium' : 'text-gray-600'}`}>
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading || !allAnswered}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Submitting...' : 'Complete my application →'}
              </button>
              <button
                type="button"
                onClick={() => setStep('done')}
                className="w-full text-gray-400 text-sm hover:text-gray-600 py-2"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </main>
    )
  }

  // ─── FORM STATE (Step 1) ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="px-6 py-5 max-w-5xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm font-medium">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        <div className="text-center mb-10 pt-8">
          <div className="inline-block bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            🧬 2 free spots remaining
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Apply for Identity Sprint</h1>
          <p className="text-gray-500 text-lg">3 minutes. I&apos;ll read this personally and reach out within 24 hours.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleFormChange}
                placeholder="Priya Sharma"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address *</label>
              <input type="email" name="email" required value={form.email} onChange={handleFormChange}
                placeholder="priya@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp number</label>
            <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleFormChange}
              placeholder="+91 98765 43210"
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
            <p className="text-xs text-gray-400 mb-3">Apps, routines, coaches — what happened?</p>
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
                  <input type="radio" name="commitment" value={option} required
                    onChange={handleFormChange} className="accent-purple-600" />
                  <span className="text-sm text-gray-600">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-60 shadow-lg">
              {loading ? 'Submitting...' : 'Continue →'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Next: a quick 5-question quiz about how you&apos;re wired for change</p>
          </div>
        </form>
      </div>
    </main>
  )
}
