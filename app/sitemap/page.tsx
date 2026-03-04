// /sitemap — Internal visual sitemap for Vignesh
// Shows all routes, their purpose, audience, and known issues
// No auth required (internal bookmark tool)

type RouteStatus = 'live' | 'issue' | 'blocked'

type Route = {
  path: string
  name: string
  description: string
  audience: 'Public' | 'Admin' | 'Participant'
  status: RouteStatus
  issues?: string[]
  connectsTo?: string[]
}

const routes: Route[] = [
  {
    path: '/',
    name: 'Landing Page',
    description: 'Marketing page — hero, problem, how-it-works, about Vignesh, CTA',
    audience: 'Public',
    status: 'live',
    connectsTo: ['/apply'],
  },
  {
    path: '/apply',
    name: 'Application Form',
    description: '2-step flow: 6-field application (name, email, WhatsApp, identity goal, tried before, why now, commitment) + self-discovery quiz',
    audience: 'Public',
    status: 'live',
    connectsTo: ['/admin'],
  },
  {
    path: '/admin',
    name: 'Admin Dashboard',
    description: 'View all applications + habit blueprints + outcome type + signal columns. Vignesh only.',
    audience: 'Admin',
    status: 'issue',
    issues: ['BUG-003: No auth on this route — password-protected via cookie auth (fix in progress)'],
    connectsTo: ['/sprint/[id]/onboarding', '/sprint/[id]/checkin'],
  },
  {
    path: '/sprint/[id]/onboarding',
    name: 'Identity Declaration',
    description: 'Participant enters their identity declaration before the sprint starts. Stored in applications.identity_declaration.',
    audience: 'Participant',
    status: 'issue',
    issues: [
      'BUG-008: POST route was using anon Supabase client → RLS blocked UPDATE. Fixed in this deploy.',
      'BUG-005: Sequential integer ID in URL — guessable. IDOR risk.',
    ],
    connectsTo: ['/sprint/[id]/checkin'],
  },
  {
    path: '/sprint/[id]/checkin',
    name: 'Weekly Check-in',
    description: 'Participant submits weekly identity_rating (1–5) + reflection. Upserts to checkins table. Shows history post-submit.',
    audience: 'Participant',
    status: 'issue',
    issues: ['BUG-005: Sequential integer ID in URL — guessable. IDOR read+write confirmed.'],
  },
  {
    path: '/thank-you',
    name: 'Thank You Page',
    description: 'Legacy page — may be unused. Application form now shows inline success state instead of redirecting here.',
    audience: 'Public',
    status: 'live',
  },
]

const STATUS_CONFIG: Record<RouteStatus, { label: string; dot: string; card: string; badge: string }> = {
  live: {
    label: 'Live ✅',
    dot: 'bg-green-400',
    card: 'border-gray-700',
    badge: 'bg-green-900 text-green-300',
  },
  issue: {
    label: 'Has issue ⚠️',
    dot: 'bg-amber-400',
    card: 'border-amber-700',
    badge: 'bg-amber-900 text-amber-300',
  },
  blocked: {
    label: 'Blocked 🔴',
    dot: 'bg-red-400',
    card: 'border-red-700',
    badge: 'bg-red-900 text-red-300',
  },
}

const AUDIENCE_BADGE: Record<string, string> = {
  Public: 'bg-blue-900 text-blue-300',
  Admin: 'bg-purple-900 text-purple-300',
  Participant: 'bg-teal-900 text-teal-300',
}

export default function Sitemap() {
  const liveCount = routes.filter(r => r.status === 'live').length
  const issueCount = routes.filter(r => r.status === 'issue').length
  const blockedCount = routes.filter(r => r.status === 'blocked').length

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🗺️</span>
            <h1 className="text-2xl font-bold text-white">Identity Sprint — App Sitemap</h1>
          </div>
          <p className="text-gray-400 text-sm">Internal reference. Every screen, who sees it, what it does, and known issues.</p>
          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>{liveCount} live</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>{issueCount} with issues</span>
            {blockedCount > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>{blockedCount} blocked</span>}
          </div>
        </div>

        {/* Flow legend */}
        <div className="mb-8 bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">User Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
            <span className="bg-gray-800 rounded-lg px-3 py-1.5">/ Landing</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-800 rounded-lg px-3 py-1.5">/apply Form</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-800 rounded-lg px-3 py-1.5">/admin Dashboard</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-800 rounded-lg px-3 py-1.5">/sprint/[id]/onboarding</span>
            <span className="text-gray-600">→</span>
            <span className="bg-gray-800 rounded-lg px-3 py-1.5">/sprint/[id]/checkin</span>
          </div>
        </div>

        {/* Route cards */}
        <div className="space-y-4">
          {routes.map((route) => {
            const statusCfg = STATUS_CONFIG[route.status]
            return (
              <div
                key={route.path}
                className={`bg-gray-900 rounded-xl border ${statusCfg.card} p-6`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot} flex-shrink-0 mt-1`}></span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={route.path.includes('[') ? '#' : route.path}
                          className={`font-mono text-base font-bold ${route.path.includes('[') ? 'text-gray-300 cursor-default' : 'text-purple-400 hover:text-purple-300 transition-colors'}`}
                          {...(route.path.includes('[') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                        >
                          {route.path}
                        </a>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${AUDIENCE_BADGE[route.audience]}`}>
                          {route.audience}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">{route.name}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 ml-5 mb-3">{route.description}</p>

                {route.issues && route.issues.length > 0 && (
                  <div className="ml-5 space-y-1">
                    {route.issues.map((issue, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-amber-400 text-xs mt-0.5 flex-shrink-0">⚠️</span>
                        <p className="text-xs text-amber-300">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}

                {route.connectsTo && route.connectsTo.length > 0 && (
                  <div className="ml-5 mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Connects to:</span>
                    {route.connectsTo.map((dest) => (
                      <span key={dest} className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {dest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* API routes note */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">API Routes</p>
          <div className="space-y-2 font-mono text-xs text-gray-400">
            <div className="flex gap-3"><span className="text-green-400 w-12">POST</span><span>/api/applications</span><span className="text-gray-600">— submit application (anon insert)</span></div>
            <div className="flex gap-3"><span className="text-blue-400 w-12">GET</span><span>/api/applications</span><span className="text-gray-600">— read all applications (service role) ⚠️ no auth gate</span></div>
            <div className="flex gap-3"><span className="text-blue-400 w-12">GET</span><span>/api/sprint/[id]/onboarding</span><span className="text-gray-600">— get declaration status</span></div>
            <div className="flex gap-3"><span className="text-green-400 w-12">POST</span><span>/api/sprint/[id]/onboarding</span><span className="text-gray-600">— save declaration (BUG-008 fixed)</span></div>
            <div className="flex gap-3"><span className="text-blue-400 w-12">GET</span><span>/api/sprint/[id]/checkin</span><span className="text-gray-600">— get checkin history</span></div>
            <div className="flex gap-3"><span className="text-green-400 w-12">POST</span><span>/api/sprint/[id]/checkin</span><span className="text-gray-600">— upsert weekly checkin</span></div>
            <div className="flex gap-3"><span className="text-green-400 w-12">POST</span><span>/api/admin/auth</span><span className="text-gray-600">— admin login (sets httpOnly cookie)</span></div>
            <div className="flex gap-3"><span className="text-red-400 w-12">DELETE</span><span>/api/admin/auth</span><span className="text-gray-600">— admin logout</span></div>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">identity-sprint.vercel.app · Last updated: March 2026</p>
      </div>
    </main>
  )
}
