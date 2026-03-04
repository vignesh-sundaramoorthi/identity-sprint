import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'is_admin_auth'
const ADMIN_LOGIN_PATH = '/admin/login'
const ADMIN_PATH = '/admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /admin routes (but not /admin/login itself)
  if (!pathname.startsWith(ADMIN_PATH) || pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return NextResponse.next()
  }

  // Also allow the auth API route
  if (pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get(ADMIN_COOKIE)

  if (!authCookie || authCookie.value !== 'true') {
    // Craft's note: silent redirect to homepage — no signal that /admin exists
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
