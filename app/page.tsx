import Link from 'next/link'

export default function Home() {
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
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          You've tried changing what you do.<br />
          <span className="text-gray-600">It's time to change who you are.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Identity Sprint is a 30-day process — anchored by an intensive first 7 days — where Vignesh works with you 1:1 to help you finally become the person you've been trying to be. Not by adding more habits. By redesigning your identity from the inside out.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/apply"
            className="bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-700 transition shadow-lg"
          >
            Apply for the next sprint →
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 text-sm text-gray-400">Spots are limited. Vignesh works with people 1:1. Takes 2 minutes to apply.</p>
      </section>

      {/* PAIN AGITATION */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">You're not failing. The approach is wrong.</h2>
        <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
          <p>
            Most transformation programs are built on the same flawed assumption: change your behavior, and eventually you'll become a different person.
          </p>
          <p>
            It doesn't work that way.
          </p>
          <p>
            Research shows that identity drives behavior — not the other way around. When you genuinely see yourself as "someone who moves their body every day," the habit becomes almost automatic. When you're running someone else's program on your old identity, even the best system will fail.
          </p>
          <p className="text-gray-900 font-semibold">
            That's why you've "tried everything" and it still didn't stick.
          </p>
          <p>
            Not because you're broken. Because the starting point was wrong.
          </p>
        </div>

        {/* Pull quote */}
        <div className="mt-10 border-l-4 border-gray-200 pl-6 py-2">
          <p className="text-gray-600 italic text-lg">
            "I've now reduced my coffee intake by 70% with Streaks — something I struggled with for 5 years."
          </p>
          <p className="text-sm text-gray-400 mt-2">— Real user review</p>
          <p className="text-sm text-gray-500 mt-1">Five years of trying the behavior-first way. Identity Sprint starts somewhere different.</p>
        </div>
      </section>

      {/* MECHANISM */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why identity change is different — and why it's not woo</h2>
          <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
            <p>
              The science here is 40+ years deep. Three research traditions — Self-Determination Theory, Implementation Intentions, and Possible Selves theory — all point to the same thing:
            </p>
            <p className="text-gray-900 font-semibold">Lasting change starts with a shift in how you see yourself.</p>
            <p>
              When someone declares "I am becoming a person who..." and then plans specifically when, where, and how they'll act on it — follow-through increases dramatically. Not through motivation. Not through discipline. Through identity alignment.
            </p>
            <p>
              That's the mechanism Identity Sprint is built on.
            </p>
            <p>
              It's not a productivity hack. It's not a 21-day challenge. It's a structured, science-backed process for updating the story you tell yourself about who you are.
            </p>
          </div>

          {/* Comparison table */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-red-50 text-red-700 px-6 py-4 text-left font-semibold w-1/2">❌ Other programs</th>
                  <th className="bg-green-50 text-green-700 px-6 py-4 text-left font-semibold w-1/2">✅ Identity Sprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Change what you do', 'Change who you are'],
                  ['Track your habits', 'Redesign your identity'],
                  ['Generic templates', 'Built around your specific goal'],
                  ['More motivation', 'A specific plan for when, where, and how'],
                  ['30 apps, zero results', 'One focused sprint with a real human'],
                ].map(([left, right], i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-6 py-3 text-gray-400 line-through">{left}</td>
                    <td className="px-6 py-3 text-gray-700 font-medium">{right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SPRINT STRUCTURE */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What the sprint actually looks like</h2>
          <p className="text-gray-500 text-lg">30 days. A clear start. A clear end. Actual transformation.</p>
        </div>

        {/* Step 1: Apply preamble */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-gray-900 tracking-wide uppercase">Step 1: Apply.</p>
          <p className="text-sm text-gray-400 mt-1">Every sprint starts with a 2-minute application. Vignesh reads every one.</p>
        </div>

        {/* Timeline — desktop: horizontal row; mobile: vertical */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: 'Before the sprint',
              title: 'Your identity goal, made vivid.',
              body: 'You fill out a short application and self-discovery quiz. Vignesh reads every word. The sprint is built around your specific identity goal — not a generic program you slot into.',
            },
            {
              label: 'Day 1',
              title: 'You declare who you're becoming.',
              body: 'Not a goal. Not a resolution. An identity statement: "I am becoming the kind of person who..." This single act — saying it and meaning it — is where identity change begins.',
            },
            {
              label: 'Days 2–7 (The Sprint)',
              title: 'You build the plan that makes it happen.',
              body: 'Using implementation intentions — the behavior change method with the largest effect sizes in the research literature — you map out specifically when, where, and how each habit happens. No willpower required.',
            },
            {
              label: 'Days 8–30 (The Loop)',
              title: 'You build the loop. You live it.',
              body: 'The sprint initiates the loop. The next 23 days are where it takes root. You have your identity declaration, your implementation plan, and a bounce-back framework for when life gets in the way. Because it will. And that's fine.',
            },
          ].map((block, i) => (
            <div key={i} className="relative">
              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                {block.label}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">{block.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{block.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">This is for you if...</h2>
          <ul className="space-y-4 mb-10">
            {[
              "You're a mid-career professional who feels like you're playing someone else's game",
              "You've tried productivity systems, habit apps, or coaching — and something still isn't clicking",
              "You know the what but can't seem to sustain the doing",
              "You want to feel like the person you've been quietly trying to become",
              "You're not looking for more content to consume — you want to actually change",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-gray-600 text-lg">
                <span className="text-gray-400 font-bold mt-0.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-5">This is NOT for you if...</h2>
          <ul className="space-y-3 p-5 bg-white rounded-2xl border border-gray-200">
            {[
              "You're looking for a quick fix or a hack",
              "You need someone to motivate you (you're already motivated — you need a structure)",
              "You're not willing to show up for 30 days and do the work",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-gray-500 text-base">
                <span className="text-red-400 flex-shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SOCIAL PROOF / EVIDENCE */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">What the research says</h2>
        <div className="bg-gray-900 text-white rounded-2xl p-8 mb-8">
          <p className="text-2xl font-bold mb-3">d = 0.65</p>
          <p className="text-gray-300 leading-relaxed">
            Implementation intentions — the specific planning method used in Identity Sprint — have an effect size of d=0.65 across 94 studies. That's among the largest effect sizes in all of behavior change research. For context: most habit apps show effects barely distinguishable from placebo.
          </p>
          <p className="text-gray-400 text-sm mt-4">This isn't a philosophy. It's a process that works because it's built on evidence.</p>
        </div>

        {/* Trust signal */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {[
            'Atomic Habits (James Clear)',
            'Self-Determination Theory (Deci & Ryan)',
            'Implementation Intentions (Gollwitzer, 94 studies, d=0.65)',
            'Possible Selves Theory (Markus & Nurius)',
          ].map((item) => (
            <span key={item} className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1">{item}</span>
          ))}
        </div>

        {/* Social proof placeholder */}
        <div className="mt-10 p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
          {/* TODO: Vignesh — Add real testimonials from your first cohort here. Format: quote + name + transformation domain (e.g., "Career pivot, Mumbai"). */}
          <p className="text-sm">Testimonials from first cohort go here</p>
        </div>
      </section>

      {/* MEET VIGNESH */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Who you're working with</h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* TODO: Vignesh — Add your photo here. Headshot preferred, candid works. Replace the placeholder div below. */}
            <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-sm">
              Photo
            </div>

            <div>
              <p className="text-white font-bold text-xl mb-4">I'm Vignesh.</p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                I have a background in data science and biotechnology — so when I say this approach is research-backed, I mean I've read the studies, not just the summaries.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                I'm also someone who's lived the gap between knowing what to do and actually becoming the person who does it. That's why I built Identity Sprint — not to sell you a system, but to work through a process with you.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                I work with a small number of people at a time. Which means when you apply, I read your application personally. If we're a fit, you'll hear from me within 24 hours.
              </p>
              <p className="text-gray-300 text-lg font-medium">This is 1:1. Not a course. Not a platform. A real person who knows your name.</p>

              {/* TODO: Vignesh — Fill in your personal story here. This is the most important section for trust.
                  Suggested: 2-3 sentences on your data/biotech/fitness background and what led you to build this.
                  What specific life experience made you understand this problem from the inside?
                  "I built this because I went through it" converts far better than credentials.
                  See Scout's note: frame around shared-struggle narrative, not qualifications. */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-500 text-sm">Background in data science · Biotechnology · Sports &amp; fitness
                  {/* TODO: Vignesh — Add specific roles/companies/credentials here */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & APPLICATION */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Simple, honest pricing</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8">
          <div className="text-5xl font-extrabold text-gray-900 mb-4">₹6,000</div>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            That's it. No session credits. No auto-renewal. No upsell at the end.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            If you've ever felt burned by coaching that charged you $450 for three 30-minute sessions and then demanded more money to use what you'd already paid for — this is intentionally the opposite of that.
          </p>
          <p className="text-gray-900 font-semibold text-lg">You pay once. You get the sprint. You leave different.</p>
        </div>

        <p className="text-gray-500 text-lg leading-relaxed mb-4">
          I work with a small cohort at a time. Apply below — I'll review your application and reach out within 24 hours if it's a fit.
        </p>
        <p className="text-gray-500 text-lg leading-relaxed mb-10">
          I turn down applications that aren't the right fit. That's not exclusivity theater — it's because this only works when the timing and the person are right.
        </p>

        <Link
          href="/apply"
          className="inline-block bg-gray-900 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-700 transition shadow-lg w-full text-center"
        >
          Apply now — takes 2 minutes →
        </Link>
        <p className="text-center text-sm text-gray-400 mt-4">Next cohort filling now. Vignesh reviews every application personally.</p>

        {/* Trust block — Intake Filter framing */}
        <div className="mt-12 max-w-xl mx-auto text-center">
          <p className="text-gray-700 text-lg leading-relaxed">
            This isn&apos;t a program you sign up for.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mt-2">
            It&apos;s an application you submit — and Vignesh decides if the fit is right.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mt-4">
            That&apos;s not a gate to keep you out. It&apos;s a signal that what happens inside the sprint is built around the person who gets in. Someone in the wrong stage doesn&apos;t benefit from it — and you&apos;d know that within a week. The intake filter is how we prevent that.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'Will I be accepted if I apply?',
                a: "Not always — and that's intentional. Vignesh personally reviews every application. If the timing and fit aren't right, he'll say so. Not because you're not capable of change, but because this sprint is designed for a specific stage of readiness — and accepting someone who isn't there yet would be doing them a disservice. If you apply and you're not the right fit right now, you'll hear honest feedback, not silence.",
              },
              {
                q: 'How is this different from a life coach?',
                a: "A traditional life coach gives you advice. Identity Sprint gives you a process — grounded in behavioral science — and then works through it with you. The difference is the mechanism: we're not talking about what you should do. We're redesigning who you are at the level of identity.",
              },
              {
                q: 'What if I miss a day?',
                a: "Missing days is data, not failure. The sprint includes a specific bounce-back plan for exactly this — because the research on behavior change is clear: relapse is normal, and how you respond to it determines whether you sustain change. Most programs shame you for slipping. We built for the reality of human life.",
              },
              {
                q: 'How do I know this will work for me specifically?',
                a: "I don't know — and I won't pretend to. That's why the application exists. I'd rather turn down people who aren't the right fit than promise everyone the same result. If your application shows that your timing and goals align with what this sprint delivers, we'll talk.",
              },
              {
                q: 'Is this for a specific area of life — career, health, relationships?',
                a: "Identity Sprint works across domains — career, fitness, lifestyle, relationships — because it targets the root (your identity) rather than any specific behavior. The sprint is personalized to your specific identity goal. What you're becoming determines what we build.",
              },
              {
                q: "I've tried coaching before and it didn't help. How is this different?",
                a: "The coaching you tried probably worked at the behavior level — what to do, how to do it. Identity Sprint goes upstream: who do you need to become for these behaviors to feel natural, not forced? That's a fundamentally different starting point.",
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-200 pb-8 last:border-0">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Ready to become who you've been trying to be?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Apply now. Takes 2 minutes. Vignesh reviews every application personally.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-gray-900 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-700 transition shadow-lg"
          >
            Apply for the next sprint →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <p>Identity Sprint · Built with intention · Questions? DM on LinkedIn</p>
      </footer>

    </main>
  )
}
