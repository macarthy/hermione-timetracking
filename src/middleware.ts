import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For now, we'll add a simple check
    // In production, this should integrate with your Azure AD authentication
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader || request.cookies.get('auth')
    
    if (!isAuthenticated) {
      // Redirect to login page or return unauthorized
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}