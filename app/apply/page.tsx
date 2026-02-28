'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Apply() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    identity_goal: '',
    tried_before: '',
    why_now: '',
    commitment: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Thank you state — shown inline after submission
  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">🙌</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">You&apos;re in the queue.</h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-6">
            I&apos;ve got your application. I read every one personally — I&apos;ll reach out within 24 hours to see if we&apos;re a good fit and to book your discovery call.
          </p>
          <div className="bg-purple-50 rounded-2xl p-6 text-left mb-8">
            <p className="font-semibold text-gray-800 mb-3">What happens next:</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. I read your application (usually same day)</li>
              <li>2. If it&apos;s a fit, I&apos;ll message you to book a 30-min discovery call</li>
              <li>3. On the call, we figure out your identity target and see if this is right for you</li>
              <li>4. If yes — we start your sprint within the week</li>
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="px-6 py-5 max-w-5xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm font-medium">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-block bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            🧬 2 free spots remaining
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Apply for Identity Sprint</h1>
          <p className="text-gray-500 text-lg">3 minutes. I&apos;ll read this personally and reach out within 24 hours.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-7">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Priya Sharma"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="priya@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp number (for check-ins)</label>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Who do you want to become? *
            </label>
            <p className="text-xs text-gray-400 mb-3">Not what habits. Who. &quot;The kind of person who...&quot; — describe your target identity.</p>
            <textarea
              name="identity_goal"
              required
              value={form.identity_goal}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. The kind of person who works out consistently without it feeling like a chore, who has energy in the evening, who doesn't need motivation to show up..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What have you already tried? *
            </label>
            <p className="text-xs text-gray-400 mb-3">Apps, routines, coaches, courses — what did you try and what happened?</p>
            <textarea
              name="tried_before"
              required
              value={form.tried_before}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Tried Habitica, a gym trainer for 3 months, YouTube productivity routines. Always works for 2-3 weeks then falls apart..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Why now? *</label>
            <p className="text-xs text-gray-400 mb-3">What&apos;s happened recently that makes this the right time?</p>
            <textarea
              name="why_now"
              required
              value={form.why_now}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Just turned 30. Realized I've been saying 'I'll start Monday' for two years..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Can you commit 30 minutes/week for 4 weeks? *
            </label>
            <div className="flex flex-wrap gap-4">
              {['Yes, absolutely', 'Mostly — some weeks might be tight', 'Not sure'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="commitment"
                    value={option}
                    required
                    onChange={handleChange}
                    className="accent-purple-600"
                  />
                  <span className="text-sm text-gray-600">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-60 shadow-lg"
            >
              {loading ? 'Submitting...' : 'Submit application →'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">I&apos;ll personally read this and reply within 24 hours.</p>
          </div>

        </form>
      </div>
    </main>
  )
}
