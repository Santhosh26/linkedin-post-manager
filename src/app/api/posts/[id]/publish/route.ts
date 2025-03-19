// src/app/api/posts/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, getLinkedInPostUrl } from '@/lib/services/linkedin';
import { createNotification } from '@/lib/services/notification';

interface RequestParams {
  params: {
    id: string;
  }
}

export async function POST(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to publish a post' },
        { status: 401 }
      );
    }
    
    const postId = params.id;
    
    // Get the post with user LinkedIn account
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                provider: 'linkedin',
              },
              select: {
                access_token: true,
                expires_at: true,
              },
            },
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check ownership
    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to publish this post' },
        { status: 403 }
      );
    }
    
    // Check if user has LinkedIn account
    if (!post.user.accounts || post.user.accounts.length === 0) {
      return NextResponse.json(
        { message: 'LinkedIn account not connected. Please connect your LinkedIn account first.' },
        { status: 400 }
      );
    }
    
    const linkedInAccount = post.user.accounts[0];
    
    // Check if token is valid
    if (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now()) {
      return NextResponse.json(
        { message: 'LinkedIn token expired. Please reconnect your account.' },
        { status: 400 }
      );
    }
    
    // Publish to LinkedIn
    const linkedinPostId = await postToLinkedIn(
      linkedInAccount.access_token,
      post.content,
      (post.visibility as 'PUBLIC' | 'CONNECTIONS') || 'PUBLIC'
    );
    
    const linkedinPostUrl = getLinkedInPostUrl(linkedinPostId);
    
    // Update the post status
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        linkedinPostId,
        linkedinPostUrl,
      },
    });
    
    // Create a notification for successful manual publishing
    await createNotification(
      post.userId,
      'SCHEDULED_POST_PUBLISHED',
      'Your post was successfully published to LinkedIn!',
      {
        postId: post.id,
        linkedinPostUrl
      }
    );
    
    return NextResponse.json({
      message: 'Post successfully published to LinkedIn',
      post: updatedPost,
      linkedinPostUrl,
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    
    // Create a notification for failed manual publishing if we have the post data
    try {
      const postId = params.id;
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true }
      });
      
      if (post) {
        await createNotification(
          post.userId,
          'SCHEDULED_POST_FAILED',
          'Failed to publish your post to LinkedIn.',
          {
            postId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating failure notification:', notificationError);
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error publishing post' },
      { status: 500 }
    );
  }
}