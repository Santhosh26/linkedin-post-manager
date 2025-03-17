// src/app/api/linkedin/post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, postWithImageToLinkedIn, getLinkedInPostUrl } from '@/lib/services/linkedin';

// Schema for posting to LinkedIn
const LinkedInPostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  visibility: z.enum(['PUBLIC', 'CONNECTIONS']).default('PUBLIC'),
  imageUrl: z.string().optional(),
});

/**
 * POST - Publish a post to LinkedIn
 */
export async function POST(req: Request) {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to share a post to LinkedIn' },
        { status: 401 }
      );
    }

    // Instead of checking session.linkedinAccessToken, check the database directly
    // This ensures consistency with the GET endpoint
    const linkedInAccount = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        provider: 'linkedin'
      },
      select: {
        access_token: true,
        expires_at: true
      }
    });

    // Verify LinkedIn account exists and has a valid token
    if (!linkedInAccount || !linkedInAccount.access_token || 
        (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now())) {
      return NextResponse.json(
        { message: 'LinkedIn account not connected. Please connect your LinkedIn account first.' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { postId, visibility, imageUrl } = LinkedInPostSchema.parse(body);

    // Get the post from the database
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    // Make sure the post belongs to the current user
    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to share this post' },
        { status: 403 }
      );
    }

    // Use the access token from the database instead of from the session
    const accessToken = linkedInAccount.access_token;
    
    // Post to LinkedIn, with or without an image
    let linkedinPostId;
    if (imageUrl) {
      linkedinPostId = await postWithImageToLinkedIn(
        accessToken,
        post.content,
        imageUrl,
        visibility
      );
    } else {
      linkedinPostId = await postToLinkedIn(
        accessToken,
        post.content,
        visibility
      );
    }

    if (!linkedinPostId) {
      return NextResponse.json(
        { message: 'Failed to post to LinkedIn' },
        { status: 500 }
      );
    }

    // Get the URL to the LinkedIn post
    const linkedinPostUrl = getLinkedInPostUrl(linkedinPostId);

    // Update the post in the database
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        linkedinPostId,
        linkedinPostUrl,
      },
    });

    return NextResponse.json({
      message: 'Successfully shared to LinkedIn',
      post: updatedPost,
      linkedinPostUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error sharing to LinkedIn:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error sharing to LinkedIn' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check LinkedIn connection status
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    // No caching headers - we want fresh responses every time
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (!session?.user) {
      return NextResponse.json(
        { connected: false, message: 'Not authenticated' },
        { status: 200, headers }
      );
    }

    // Check if the user has a connected LinkedIn account
    const account = await prisma.account.findFirst({
      where: { 
        userId: session.user.id,
        provider: 'linkedin'
      },
      select: {
        id: true,
        access_token: true,
        expires_at: true
      }
    });

    // Determine connection status: account must exist and have a valid token
    // If expires_at exists, check if it's still valid
    const isConnected = !!account && 
      !!account.access_token && 
      (!account.expires_at || account.expires_at * 1000 > Date.now());

    console.log(`LinkedIn connection check for user ${session.user.id}: ${isConnected ? 'Connected' : 'Not connected'}`);

    return NextResponse.json(
      { connected: isConnected },
      { headers }
    );
  } catch (error) {
    console.error('Error checking LinkedIn connection:', error);
    return NextResponse.json(
      { 
        connected: false,
        message: 'Error checking LinkedIn connection'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}