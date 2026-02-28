import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Application = {
  id: number
  name: string
  email: string
  whatsapp?: string
  submitted_at: string
  status: string
  identity_goal: string
  tried_before: string
  why_now: string
  commitment: string
}

async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return []
  }
  return data || []
}

export default async function Admin() {
  const applications = await getApplications()

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Applications</h1>
            <p className="text-gray-500 mt-1">
              {applications.length} total · {applications.filter((a) => a.status === 'new').length} new
            </p>
          </div>
          <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Identity Sprint Admin
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 text-lg">No applications yet. Share your link!</p>
            <p className="text-gray-400 text-sm mt-2">identity-sprint.vercel.app/apply</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{app.name}</h2>
                    <div className="flex gap-3 mt-1">
                      <a href={`mailto:${app.email}`} className="text-purple-600 text-sm hover:underline">{app.email}</a>
                      {app.whatsapp && <span className="text-gray-400 text-sm">· {app.whatsapp}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'new' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(app.submitted_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
