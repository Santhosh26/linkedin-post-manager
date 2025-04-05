// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware adds cache-control headers to API responses to prevent excessive calls
export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Handle LinkedIn status checks with aggressive caching
    // KEEP THIS PART if you still want caching for LinkedIn status
    if (request.nextUrl.pathname === '/api/linkedin/post' && request.method === 'GET') {
      const response = NextResponse.next()
      
      // Add cache-control headers to the LinkedIn status check
      response.headers.set('Cache-Control', 'private, max-age=60, s-maxage=60')
      
      return response
    }

    // --- REMOVE OR COMMENT OUT THE SESSION CACHING ---
    /* 
    // Handle session checks with moderate caching
    if (request.nextUrl.pathname === '/api/auth/session') {
      const response = NextResponse.next()
      
      // Add cache-control headers to the session check
      response.headers.set('Cache-Control', 'private, max-age=30, s-maxage=30')
      
      return response
    }
    */
  }

  // IMPORTANT: Always return NextResponse.next() if no specific response is generated
  return NextResponse.next()
}

// Configure the matcher - REMOVE /api/auth/session
export const config = {
  matcher: [
    '/api/linkedin/post',
    // '/api/auth/session', // Remove this line
  ],
}