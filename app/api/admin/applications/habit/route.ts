import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

// PATCH /api/admin/applications/habit
// Sets habit_recommendation and/or coach feedback on a specific application
// Body: {
//   id: number,
//   habit_recommendation?: string,
//   habit_recommendation_feedback?: 'helpful' | 'not_helpful' | 'custom',
//   habit_recommendation_custom?: string | null,
//   habit_recommendation_chosen?: string | null,   // learning signal: actual habit prescribed
// }

export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const body = await req.json()
  const {
    id,
    habit_recommendation,
    habit_recommendation_feedback,
    habit_recommendation_custom,
    habit_recommendation_chosen,
  } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  // Build update payload — only include fields present in request
  const updates: Record<string, unknown> = {}
  if (habit_recommendation !== undefined) {
    updates.habit_recommendation = habit_recommendation
  }
  if (habit_recommendation_feedback !== undefined) {
    const allowed = ['helpful', 'not_helpful', 'custom']
    if (!allowed.includes(habit_recommendation_feedback)) {
      return NextResponse.json(
        { error: 'habit_recommendation_feedback must be helpful | not_helpful | custom' },
        { status: 400 }
      )
    }
    updates.habit_recommendation_feedback = habit_recommendation_feedback
  }
  if (habit_recommendation_custom !== undefined) {
    updates.habit_recommendation_custom = habit_recommendation_custom
  }
  if (habit_recommendation_chosen !== undefined) {
    updates.habit_recommendation_chosen = habit_recommendation_chosen
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('applications')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('habit update error:', error)
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
