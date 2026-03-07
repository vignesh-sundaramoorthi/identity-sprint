import { supabaseAdmin } from '@/lib/supabase'
import DiscoveryCallGuide from './components/DiscoveryCallGuide'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CRAVING_LABELS: Record<string, string> = {
  stability: '🏛️ Stability & Structure',
  novelty: '⚡ Novelty & Excitement',
  connection: '🤝 Connection & Belonging',
  recognition: '🏆 Recognition & Progress',
  competence: '🧠 Mastery & Competence',
  autonomy: '🎯 Autonomy & Control',
}

// Phase 3 PR1 amendment — Craving coaching tooltips (verbatim copy: Craft H93)
// Zero DB changes: craving type is already in the discovery row.
// These read as coaching reminders, not data labels.
const CRAVING_COACHING: Record<string, string> = {
  stability: "Disruption is this person's #1 churn risk. When life gets chaotic, even motivated sprinters with STABILITY patterns lose traction. Proactively script a 'life interruption' plan in Week 2 before they need it.",
  novelty: "They may self-identify as 'shiny object syndrome' — pre-empt that narrative. Add visible variety hooks in Weeks 2–3. The goal: make the sprint itself feel like the new interesting thing each week.",
  connection: "The coach relationship IS the product for this person, not a delivery channel. Named, personal check-ins matter more than any feature. If they go quiet, reach out — don't wait for them to.",
  recognition: "Plan explicit milestone acknowledgment in Weeks 2–3. Silent progress = silent disengagement for RECOGNITION types. They're also your highest-share-potential segment if they feel seen.",
  competence: "Frame daily reps as evidence of becoming, not boxes to check. Progress quality signals matter more than streaks for this type. If they're doing the habit sloppily just to complete it, that's a flag.",
  autonomy: "Co-design frame on discovery call: 'Here's what the research says for your pattern — how would you apply it to your life?' not 'Here's your Week 1 habit.' They'll own it if they built it.",
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
  habit_recommendation?: string | null
}

type Discovery = {
  email: string; name: string
  q1_need?: string; q2_blocker?: string; q3_motivator?: string
  q4_energiser?: string; q5_success?: string; q6_failure?: string
  primary_craving?: string; secondary_craving?: string; primary_failure?: string
}

async function getData() {
  const [{ data: apps, error: appsError }, { data: discoveries, error: discError }] = await Promise.all([
    supabaseAdmin.from('applications').select('*').order('submitted_at', { ascending: false }),
    supabaseAdmin.from('discovery').select('*').order('submitted_at', { ascending: false }),
  ])
  if (appsError) console.error('Applications fetch error:', appsError)
  if (discError) console.error('Discovery fetch error:', discError)
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
          <div className="flex items-center gap-3">
            <a href="/admin/participants" className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              👥 Participants
            </a>
            <a href="/admin/challenges" className="border border-purple-200 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              🏃 Challenges
            </a>
            <a href="/admin/habits" className="border border-purple-200 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              📚 Habits
            </a>
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Identity Sprint Admin</div>
          </div>
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

                    {/* Phase 3 PR1 — tried_before discovery call hint (Obj 3: "I've tried things before") */}
                    {app.tried_before && app.tried_before.trim().length > 10 && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">🎯 Discovery call hint — Objection 3</p>
                        <p className="text-sm text-amber-900 leading-relaxed">
                          This person has tried before. <span className="font-semibold">Don&apos;t defend the sprint — validate their frustration first.</span> Ask: &ldquo;What made you stop last time — was it motivation, life getting busy, or something else?&rdquo; Then reframe: past attempts failed at the system level, not the person level. Identity Sprint changes the substrate, not the habit.
                        </p>
                      </div>
                    )}
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
                      {/* Craving coaching tooltip — verbatim Craft H93 copy */}
                      {disc.primary_craving && CRAVING_COACHING[disc.primary_craving] && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-3">
                          <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-1">
                            🎯 Coaching note — {CRAVING_LABELS[disc.primary_craving]}
                          </p>
                          <p className="text-sm text-indigo-900 leading-relaxed">
                            {CRAVING_COACHING[disc.primary_craving]}
                          </p>
                        </div>
                      )}
                      {disc.q6_failure && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Their own words on failure</p>
                          <p className="text-sm text-gray-700 italic">&ldquo;{disc.q6_failure}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phase 2 — Discovery Call Guide (domain selector + gateway habit card) */}
                  <div className="p-6 pt-0">
                    <DiscoveryCallGuide
                      applicationId={app.id}
                      identityGoal={app.identity_goal}
                      currentHabitRec={app.habit_recommendation}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
