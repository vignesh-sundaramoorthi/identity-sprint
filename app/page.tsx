import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-lg text-gray-900">Identity Sprint</span>
        <Link
          href="/apply"
          className="bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-700 transition"
        >
          Apply now →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-block bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🧬 2 free spots remaining
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Stop fighting yourself.<br />
          <span className="text-brand-600">Become someone different.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Most transformation fails because you're trying to bolt new habits onto an old identity.
          Identity Sprint is a 30-day done-with-you program that redesigns <em>who you are</em> — so the habits follow naturally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/apply"
            className="bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-100"
          >
            Apply for a free spot →
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 text-sm text-gray-400">No credit card. 2 spots free. Then ₹6,000.</p>
      </section>

      {/* Social proof / credibility */}
      <section className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-8">Built on science, not motivation</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'Identity-first', desc: 'Based on James Clear\'s identity-based habits and self-determination theory — not willpower.' },
              { icon: '🎯', title: 'Lifestyle design', desc: 'We design your environment and daily architecture so change becomes the path of least resistance.' },
              { icon: '✨', title: 'Enjoyment over discipline', desc: 'If it feels like a grind, it won\'t last. We find what makes the process itself feel good.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 text-left shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">You've tried everything. It still didn't stick.</h2>
        <div className="space-y-4 text-gray-500 text-lg leading-relaxed">
          <p>The habit tracker. The morning routine. The accountability partner. The course you bought and never finished.</p>
          <p>For a few weeks — it works. Then life happens. And you're back where you started, wondering what's wrong with you.</p>
          <p className="text-gray-900 font-semibold">Nothing's wrong with you. The approach is wrong.</p>
          <p>You're trying to add new behaviors to an old identity. That's like renovating a house on a broken foundation. It doesn't hold.</p>
          <p>The people who change for good don't rely on motivation. They change <em>who they are</em>. And that's exactly what this sprint is designed to do.</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-brand-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How the 30-day sprint works</h2>
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Discovery call (Week 0)',
                desc: 'We talk for 30 minutes. You tell me who you want to become. Not what habits you want. Who you\'re trying to be. I listen for what\'s actually underneath the surface.',
              },
              {
                step: '02',
                title: 'Your Identity Blueprint',
                desc: 'I build you a personalised document: your current vs. target identity, 3 keystone habits designed to feel enjoyable, your lifestyle redesign, and one environmental change to make this week.',
              },
              {
                step: '03',
                title: 'Weekly check-ins (4 weeks)',
                desc: 'Not "did you do the thing?" check-ins. We ask: what felt natural? What felt like a grind? We iterate the blueprint until the new identity starts to feel like home.',
              },
              {
                step: '04',
                title: 'The shift',
                desc: 'By week 4, the behaviors aren\'t something you do. They\'re something you are. That\'s the only kind of change that compounds.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">This is for you if...</h2>
        <ul className="space-y-4">
          {[
            'You\'ve been trying to change something for months (or years) and it keeps not sticking',
            'You want to get fitter, learn something new, build a career identity, or break a pattern',
            'You\'re willing to question the approach, not just try harder',
            'You want to work with someone, not follow a template alone',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-gray-600 text-lg">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-sm"><strong className="text-gray-700">Not for:</strong> People looking for a quick fix, a magic system, or someone to hand them a PDF and call it coaching.</p>
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Built by someone obsessed with the science of change</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            I'm Vignesh — a researcher with a background in data science, biotechnology, and competitive sports. I've spent years studying why some people change and most don't.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            The answer isn't discipline. It's identity. And the path there runs through lifestyle design and habits that actually feel good to do.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            I'm running this sprint because I want to test these ideas with real people before I build anything bigger. You get a serious, personalised program. I get to learn what actually works. Fair trade.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🎯 2 free spots — then ₹6,000
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to actually change?</h2>
          <p className="text-gray-500 text-lg mb-8">Takes 3 minutes to apply. I'll reach out within 24 hours to see if we're a fit.</p>
          <Link
            href="/apply"
            className="inline-block bg-brand-600 text-white px-10 py-5 rounded-xl text-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-100"
          >
            Apply now — it's free →
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
