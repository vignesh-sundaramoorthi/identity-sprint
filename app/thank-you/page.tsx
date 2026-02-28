import Link from 'next/link'

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="text-6xl mb-6">🙌</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">You're in the queue.</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-6">
          I've got your application. I read every one personally — I'll reach out within 24 hours to see if we're a good fit and to book your discovery call.
        </p>
        <div className="bg-brand-50 rounded-2xl p-6 text-left mb-8">
          <p className="font-semibold text-gray-800 mb-2">What happens next:</p>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. I read your application (usually same day)</li>
            <li>2. If it's a fit, I'll message you to book a 30-min discovery call</li>
            <li>3. On the call, we figure out your identity target and see if this is right for you</li>
            <li>4. If yes — we start your sprint within the week</li>
          </ol>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          In the meantime — notice one moment today where you're acting from your old identity vs. who you want to become. That's the work.
        </p>
        <Link href="/" className="text-brand-600 font-semibold hover:underline">← Back to home</Link>
      </div>
    </main>
  )
}
