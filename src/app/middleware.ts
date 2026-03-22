import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const isLoggedIn = request.cookies.has('accessToken') || request.cookies.has('refreshToken')

  // If the server doesn't see a cookie, we CANNOT redirect here anymore!
  // This is because the new Auth persistence uses localStorage, which the server cannot read.
  // We must let the request go through to the client so AuthHydrator can read localStorage and restore the session.
  // if (!isPublic && !isLoggedIn) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}
