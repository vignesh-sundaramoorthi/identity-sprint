import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'is_admin_auth'
const ADMIN_LOGIN_PATH = '/admin/login'
const ADMIN_API_PATH = '/api/admin'
const ADMIN_AUTH_API_PATH = '/api/admin/auth'
const ADMIN_PATH = '/admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API admin routes ──────────────────────────────────────────────────────
  // Guard /api/admin/* (except /api/admin/auth which handles its own login)
  if (pathname.startsWith(ADMIN_API_PATH)) {
    if (pathname.startsWith(ADMIN_AUTH_API_PATH)) {
      return NextResponse.next()
    }
    const authCookie = request.cookies.get(ADMIN_COOKIE)
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // ── Browser admin routes ──────────────────────────────────────────────────
  // Guard /admin/* (except /admin/login itself)
  if (!pathname.startsWith(ADMIN_PATH) || pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get(ADMIN_COOKIE)
  if (!authCookie || authCookie.value !== 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
