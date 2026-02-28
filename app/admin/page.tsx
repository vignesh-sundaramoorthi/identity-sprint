import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CRAVING_LABELS: Record<string, string> = {
  stability: '🏛️ Stability & Structure',
  novelty: '⚡ Novelty & Excitement',
  connection: '🤝 Connection & Belonging',
  recognition: '🏆 Recognition & Progress',
  competence: '🧠 Mastery & Competence',
  autonomy: '🎯 Autonomy & Control',
}

const FAILURE_LABELS: Record<string, string> = {
  no_identity_anchor: '🪞 Missing identity anchor',
  willpower_reliance: '💪 Relying on willpower',
  environment_not_designed: '🏠 Environment not designed',
  habit_too_big: '🏔️ Habit too ambitious',
  no_immediate_reward: '⏳ No immediate reward',
  vague_intention: '🌫️ Vague intention / no cue',
  social_environment: '👥 Social environment working against',
}

type Application = {
  id: number; name: string; email: string; whatsapp?: string
  submitted_at: string; status: string; identity_goal: string
  tried_before: string; why_now: string; commitment: string
}

type Discovery = {
  email: string; name: string
  q1_need?: string; q2_blocker?: string; q3_motivator?: string
  q4_energiser?: string; q5_success?: string; q6_failure?: string
  primary_craving?: string; secondary_craving?: string; primary_failure?: string
}

async function getData() {
  const [{ data: apps }, { data: discoveries }] = await Promise.all([
    supabaseAdmin.from('applications').select('*').order('submitted_at', { ascending: false }),
    supabaseAdmin.from('discovery').select('*').order('submitted_at', { ascending: false }),
  ])
  return {
    applications: (apps || []) as Application[],
    discoveries: (discoveries || []) as Discovery[],
  }
}

export default async function Admin() {
  const { applications, discoveries } = await getData()

  // Map discoveries by email for quick lookup
  const discoveryMap = Object.fromEntries(
    discoveries.map(d => [d.email, d])
  )

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Applications</h1>
            <p className="text-gray-500 mt-1">
              {applications.length} total · {applications.filter(a => a.status === 'new').length} new · {discoveries.length} with blueprint
            </p>
          </div>
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Identity Sprint Admin</div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 text-lg">No applications yet. Share your link!</p>
            <p className="text-gray-400 text-sm mt-2">identity-sprint.vercel.app/apply</p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((app) => {
              const disc = discoveryMap[app.email]
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{app.name}</h2>
                        <div className="flex gap-3 mt-1">
                          <a href={`mailto:${app.email}`} className="text-purple-600 text-sm hover:underline">{app.email}</a>
                          {app.whatsapp && <span className="text-gray-400 text-sm">· {app.whatsapp}</span>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'new' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {app.status}
                        </span>
                        {disc && (
                          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">🧬 Blueprint ready</span>
                        )}
                        <p className="text-gray-400 text-xs">
                          {new Date(app.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Application details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Identity goal</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{app.identity_goal}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What they&apos;ve tried</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{app.tried_before}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why now</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{app.why_now}</p>
                        <p className="text-xs text-gray-400 mt-2">Commitment: {app.commitment}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blueprint section */}
                  {disc && (
                    <div className="border-t border-gray-100 bg-gradient-to-r from-purple-50 to-white p-6">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-4">🧬 Habit Blueprint — for your discovery call</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-4 border border-purple-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary craving</p>
                          <p className="text-sm font-bold text-purple-800">{disc.primary_craving ? CRAVING_LABELS[disc.primary_craving] : '—'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-purple-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Secondary craving</p>
                          <p className="text-sm font-bold text-purple-700">{disc.secondary_craving ? CRAVING_LABELS[disc.secondary_craving] : '—'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-amber-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why it failed before</p>
                          <p className="text-sm font-bold text-amber-700">{disc.primary_failure ? FAILURE_LABELS[disc.primary_failure] : '—'}</p>
                        </div>
                      </div>
                      {disc.q6_failure && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Their own words on failure</p>
                          <p className="text-sm text-gray-700 italic">&ldquo;{disc.q6_failure}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
