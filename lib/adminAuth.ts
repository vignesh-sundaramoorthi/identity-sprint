import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_COOKIE = 'is_admin_auth'

/**
 * Returns a 401 NextResponse if the request is not authenticated as admin,
 * or null if auth passes. Use at the top of every /api/admin/* handler.
 *
 * Usage:
 *   const authError = requireAdminAuth()
 *   if (authError) return authError
 */
export function requireAdminAuth(): NextResponse | null {
  const cookieStore = cookies()
  const authCookie = cookieStore.get(ADMIN_COOKIE)
  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
