import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/admin/checkins
// Mark a wall alert as responded (sets wall_responded_at)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { checkin_id } = body

  if (!checkin_id) {
    return NextResponse.json({ error: 'checkin_id required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('checkins')
    .update({ wall_responded_at: new Date().toISOString() })
    .eq('id', checkin_id)
    .is('wall_responded_at', null) // idempotent — don't overwrite if already responded

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
