// src/app/api/auth/callback/linkedin/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * This route serves as a workaround for LinkedIn OAuth callback handling
 * to ensure the user is redirected back to the settings page with the LinkedIn tab active
 */
export async function GET(req: Request) {
  // Get the current session after OAuth
  const session = await auth();
  
  if (!session?.user) {
    // If there's no session, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Redirect to the settings page with the LinkedIn tab active
  return NextResponse.redirect(new URL('/settings?tab=linkedin', req.url));
}