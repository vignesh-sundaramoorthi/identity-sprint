import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cohort 2 — Identity Sprint',
  description: 'Not a subscription. Not a streak. A permanent shift in who you are.',
  openGraph: {
    title: 'Cohort 2 — Identity Sprint',
    description: 'Not a subscription. Not a streak. A permanent shift in who you are.',
    url: 'https://identity-sprint.vercel.app/cohort2',
    siteName: 'Identity Sprint',
    type: 'website',
    images: [
      {
        url: 'https://identity-sprint.vercel.app/api/og/cohort2',
        width: 1200,
        height: 630,
        alt: 'Cohort 2 — Identity Sprint — Who are you becoming?',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cohort 2 — Identity Sprint',
    description: 'Not a subscription. Not a streak. A permanent shift in who you are.',
    images: ['https://identity-sprint.vercel.app/api/og/cohort2'],
  },
}

export default function Cohort2Page() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-lg text-gray-900">Identity Sprint</span>
        <Link
          href="/apply"
          className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-700 transition"
        >
          Apply now →
        </Link>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
          Cohort 2 — Now Forming
        </p>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Who are you becoming?
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Not what habit are you building. Not what streak are you on. Who. You're. Becoming.
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          That's the question every app in the top 10 of the health charts can't ask you. Identity Sprint starts there — and ends with a permanent shift in who you are.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/apply"
            className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-700 transition shadow-lg"
          >
            Apply for Cohort 2 →
          </Link>
        </div>
        <p className="mt-5 text-sm text-gray-400">Spots are limited. Vignesh works with people 1:1. Takes 2 minutes to apply.</p>
      </section>

      {/* OSCILLATION LAYER */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          The apps at the top of the charts keep coming back. And leaving. And coming back.
        </h2>
        <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
          <p>
            There's a pattern in the health and fitness charts. Apps rise. They hit the top 10. Then they drop. Then they return. Then they drop again. Fitness apps, habit trackers, AI coaches — all of them oscillate.
          </p>
          <p>
            That oscillation isn't a failure of the app. It's a structural feature of behavior-first products. They work until they don't. Users engage, plateau, disengage, re-engage when motivation spikes again. The cycle repeats.
          </p>
          <p>
            Identity Sprint isn't in that cycle. Not because it's better built. Because it's solving a different problem.
          </p>
          <p className="text-gray-900 font-semibold">
            When you change who you are — not just what you do — you don't need to re-engage with a product to stay consistent. The identity does the work.
          </p>
        </div>
      </section>

      {/* PREREQUISITE FRAME */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Not an alternative to your other tools. A prerequisite for them.
        </h2>
        <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
          <p>
            You can keep using your fitness app. Your habit tracker. Your AI coach. Identity Sprint doesn't replace any of them.
          </p>
          <p>
            What it does is change the person using them.
          </p>
          <p>
            Right now, you're using those tools on an identity that doesn't fully believe it belongs in the results they promise. That's why the motivation comes and goes. That's why you re-download the same app six months later.
          </p>
          <p>
            Identity Sprint builds the foundation first — the identity — so that when you go back to your other tools, they actually work. Consistently. Without the motivational weather.
          </p>
          <p className="text-gray-900 font-semibold">
            One sprint. A permanent shift in who those tools are being used by.
          </p>
        </div>
      </section>

      {/* PERMANENCE */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="rounded-2xl bg-gray-900 px-8 py-10 text-center">
          <p className="text-2xl font-bold text-white leading-snug">
            Not a subscription. Not a streak.<br />
            <span className="text-gray-400">A permanent shift in who you are.</span>
          </p>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">What the 30-day sprint includes</h2>
        <ul className="space-y-5">
          {[
            {
              title: 'Discovery call',
              desc: 'Vignesh works with you 1:1 to design your identity goal and gateway habit. Not a template. Your specific situation.',
            },
            {
              title: 'Future Identity Profile',
              desc: 'A coach-approved card: who you\'re becoming, the traits you\'ll embody, and an anchor statement that\'s yours. It lives on your sprint dashboard throughout the 30 days.',
            },
            {
              title: 'Weekly check-ins',
              desc: 'Each week: one question. How close are you to this person? Simple, consistent, identity-anchored.',
            },
            {
              title: 'Gateway habit prescription',
              desc: 'The one habit — backed by research — that unlocks the rest for your specific identity goal. Not a list. The right one.',
            },
            {
              title: 'Day 31 debrief',
              desc: 'A closing session to assess who you became. Honest, specific, and yours to keep.',
            },
          ].map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <span className="font-semibold text-gray-900">{item.title}</span>
                <span className="text-gray-600"> — {item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CLOSING — UNINSTALL LINE */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
          <p>
            Every app in the top 10 can be uninstalled. The identity you build in a sprint can't be.
          </p>
          <p>
            That's not a product feature. That's the difference between behavior change and identity change.
          </p>
          <p className="text-gray-900 font-semibold">
            Cohort 2 is forming now. Applications take 2 minutes.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Apply for Cohort 2
        </h2>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Vignesh works with a small number of people at a time. There's an application because there should be — this only works if you're ready.
        </p>
        <Link
          href="/apply"
          className="inline-block bg-gray-900 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-700 transition shadow-lg"
        >
          Apply now — takes 2 minutes →
        </Link>
        <p className="mt-5 text-sm text-gray-400">
          ₹6,000 · 30 days · 1:1 with Vignesh · Identity Sprint
        </p>
      </section>

    </main>
  )
}
