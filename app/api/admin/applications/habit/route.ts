import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

// PATCH /api/admin/applications/habit
// Sets habit_recommendation on a specific application
// Body: { id: number, habit_recommendation: string }

export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const body = await req.json()
  const { id, habit_recommendation } = body

  if (!id || !habit_recommendation) {
    return NextResponse.json({ error: 'id and habit_recommendation required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('applications')
    .update({ habit_recommendation })
    .eq('id', id)

  if (error) {
    console.error('habit_recommendation update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// Stub GET/POST/DELETE for auth-before-405 (BUG-012 pattern)
export async function GET(_req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
export async function POST(_req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
export async function DELETE(_req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
