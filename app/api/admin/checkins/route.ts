import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

// BUG-012 FIX: Auth must fire before method validation.
// For methods not handled by this route, check auth first (return 401 if not
// authenticated) then return 405. This prevents leaking endpoint existence
// to unauthenticated callers via the 405 status code.
async function methodNotAllowed(): Promise<NextResponse> {
  const authError = await requireAdminAuth()
  if (authError) return authError
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function GET()    { return methodNotAllowed() }
export async function POST()   { return methodNotAllowed() }
export async function PUT()    { return methodNotAllowed() }
export async function DELETE() { return methodNotAllowed() }

// PATCH /api/admin/checkins
// Mark a wall alert as responded (sets wall_responded_at)
export async function PATCH(req: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

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
