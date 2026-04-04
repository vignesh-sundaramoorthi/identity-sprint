import { supabase } from '@/lib/supabase'

// Keepalive cron — runs every 6 hours to prevent Supabase project from pausing.
// Scheduled via vercel.json: { "crons": [{ "path": "/api/cron/keepalive", "schedule": "0 */6 * * *" }] }
export async function GET() {
  await supabase.from('applications').select('id').limit(1)
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
