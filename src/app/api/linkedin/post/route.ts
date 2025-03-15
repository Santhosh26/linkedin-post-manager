// src/app/api/linkedin/post/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, getLinkedInPostUrl } from '@/lib/services/linkedin';

// Schema for posting to LinkedIn
const LinkedInPostSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  visibility: z.enum(['PUBLIC', 'CONNECTIONS']).default('PUBLIC'),
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

    // Check if the user has connected their LinkedIn account
    if (!session.linkedinAccessToken) {
      return NextResponse.json(
        { message: 'LinkedIn account not connected. Please connect your LinkedIn account first.' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { postId, visibility } = LinkedInPostSchema.parse(body);

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

    // Post to LinkedIn
    const linkedinPostId = await postToLinkedIn(
      session.linkedinAccessToken as string,
      post.content,
      visibility
    );

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
export async function GET() {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to check LinkedIn connection status' },
        { status: 401 }
      );
    }

    // Check if the user has connected their LinkedIn account
    const isConnected = !!session.linkedinAccessToken;

    return NextResponse.json({
      connected: isConnected,
    });
  } catch (error) {
    console.error('Error checking LinkedIn connection:', error);
    return NextResponse.json(
      { message: 'Error checking LinkedIn connection' },
      { status: 500 }
    );
  }
}