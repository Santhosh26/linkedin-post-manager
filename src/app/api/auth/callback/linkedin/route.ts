// src/app/api/auth/callback/linkedin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * This route handles the LinkedIn OAuth callback
 * It processes the authorization code from LinkedIn and exchanges it for an access token
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Handle LinkedIn auth errors
    if (error) {
      console.error(`LinkedIn authentication error: ${error}`);
      console.error(`Error description: ${errorDescription}`);
      
      // Decode the error description for logging
      let decodedError = '';
      try {
        decodedError = decodeURIComponent(errorDescription || '');
        console.error(`Decoded error: ${decodedError}`);
      } catch (e) {
        console.error('Could not decode error description');
      }
      
      return NextResponse.redirect(new URL(`/settings?error=linkedin_${error}`, req.url));
    }
    
    // Check for required parameters
    if (!code) {
      console.error('No authorization code provided by LinkedIn');
      return NextResponse.redirect(new URL('/settings?error=missing_code', req.url));
    }
    
    // Get the current session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Exchange the authorization code for an access token
    console.log('Exchanging authorization code for access token');
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('Access token received successfully');
    const { access_token, expires_in, refresh_token } = tokenResponse.data;
    
    // We'll use a placeholder ID since we can't fetch the profile with just w_member_social scope
    // In a production app, you might want to store this differently
    const linkedInId = `linkedin_user_${Date.now()}`;
    
    // Save the LinkedIn connection in the database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: linkedInId
        }
      },
      update: {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        refresh_token,
        scope: 'w_member_social'
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'linkedin',
        providerAccountId: linkedInId,
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
        refresh_token,
        scope: 'w_member_social',
        token_type: 'bearer'
      }
    });
    
    console.log('LinkedIn account saved to database');
    
    // Determine the redirect URL from state parameter or use default
    let redirectUrl = '/settings?tab=linkedin&success=true';
    if (state) {
      try {
        redirectUrl = Buffer.from(state, 'base64').toString();
        // Append success parameter
        redirectUrl += (redirectUrl.includes('?') ? '&' : '?') + 'success=true';
      } catch (e) {
        console.error('Failed to decode state parameter:', e);
      }
    }
    
    console.log(`Redirecting to: ${redirectUrl}`);
    
    // Redirect to the settings page with the LinkedIn tab active
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error('Error in LinkedIn callback:', error);
    
    // Log more detailed error information
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    
    return NextResponse.redirect(new URL('/settings?error=callback_failed', req.url));
  }
}