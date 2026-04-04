import { supabase } from '@/lib/supabase'

export async function GET() {
  const { error } = await supabase.from('applications').select('id').limit(1)
  return Response.json({
    status: 'ok',
    db: error ? 'error' : 'connected',
    timestamp: new Date().toISOString(),
  })
}
