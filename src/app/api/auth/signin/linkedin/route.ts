// src/app/api/auth/signin/linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Extract the callback URL from the query parameters
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/settings?tab=linkedin';
    
    console.log(`LinkedIn signin requested with callback URL: ${callbackUrl}`);
    
    // Construct the LinkedIn authorization URL directly
    const redirectUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    
    // Get clientId from environment variable
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    
    if (!clientId) {
      console.error('LinkedIn client ID not configured');
      return NextResponse.redirect(new URL('/settings?error=linkedin_config', request.url));
    }
    
    // Add query parameters - Notice that we're only requesting w_member_social scope
    // as that's the only one we absolutely need for posting
    redirectUrl.searchParams.append('response_type', 'code');
    redirectUrl.searchParams.append('client_id', clientId);
    redirectUrl.searchParams.append('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`);
    redirectUrl.searchParams.append('state', Buffer.from(callbackUrl).toString('base64'));
    redirectUrl.searchParams.append('scope', 'openid email profile w_member_social');
    
    console.log(`Redirecting to LinkedIn authorization: ${redirectUrl.toString()}`);
    
    // Redirect to LinkedIn authorization endpoint
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in LinkedIn signin route:', error);
    return NextResponse.redirect(new URL('/settings?error=linkedin_auth', request.url));
  }
}