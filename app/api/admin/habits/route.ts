// Admin Habits API
// GET    /api/admin/habits — list habits + domains
// POST   /api/admin/habits — create habit
// PATCH  /api/admin/habits — update habit
// DELETE /api/admin/habits — delete habit

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/adminAuth'

export async function GET() {
  const authError = requireAdminAuth()
  if (authError) return authError

  const { data: domains } = await supabaseAdmin
    .from('habit_domains')
    .select('*')
    .order('name')

  const { data: habits, error } = await supabaseAdmin
    .from('habits')
    .select('*, habit_domains(id, name, emoji)')
    .order('domain_id')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ domains: domains ?? [], habits: habits ?? [] })
}

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const body = await req.json()
  const { name, description, difficulty, domain_id, simpler_version } = body

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('habits')
    .insert({ name, description, difficulty: difficulty ?? 'medium', domain_id, simpler_version })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const authError = requireAdminAuth()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('habits')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
