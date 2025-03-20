// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { postToLinkedIn, getLinkedInPostUrl } from '@/lib/services/linkedin';
import { createNotification } from '@/lib/services/notification';

interface RequestParams {
  params: {
    id: string;
  };
}

const PostUpdateSchema = z.object({
  content: z.string().min(10, 'Post content is required').optional(),
  hashtags: z.array(z.string()).optional(),
  topicId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
  scheduledFor: z.string().optional(), // ISO string date
  publish: z.boolean().optional(), // New field to indicate if the post should be published
  visibility: z.enum(['PUBLIC', 'CONNECTIONS']).optional(),
});

// GET a single post by ID
export async function GET(req: NextRequest, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access posts' },
        { status: 401 }
      );
    }

    const { id } = params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
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

    // Make sure the post belongs to the user
    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to access this post' },
        { status: 403 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { message: 'Error fetching post' },
      { status: 500 }
    );
  }
}

// PUT - update a post
export async function PUT(req: NextRequest, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update a post' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { content, hashtags, topicId, status, scheduledFor, publish, visibility } = PostUpdateSchema.parse(body);

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to update this post' },
        { status: 403 }
      );
    }

    // If topicId is changed, verify it exists and belongs to the user
    if (topicId && topicId !== existingPost.topicId) {
      const topic = await prisma.topic.findUnique({
        where: {
          id: topicId,
        },
      });

      if (!topic) {
        return NextResponse.json(
          { message: 'Topic not found' },
          { status: 404 }
        );
      }

      if (topic.userId !== session.user.id) {
        return NextResponse.json(
          { message: 'You do not have permission to access this topic' },
          { status: 403 }
        );
      }
    }

    // Publish the post to LinkedIn if requested
    let linkedinPostId = existingPost.linkedinPostId;
    let linkedinPostUrl = existingPost.linkedinPostUrl;
    
    if (publish) {
      // Get the user's LinkedIn account
      const linkedInAccount = await prisma.account.findFirst({
        where: { 
          userId: session.user.id,
          provider: 'linkedin'
        },
        select: {
          access_token: true,
          expires_at: true,
        }
      });

      // Verify LinkedIn account exists and has a valid token
      if (!linkedInAccount || !linkedInAccount.access_token || 
          (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now())) {
        return NextResponse.json(
          { message: 'LinkedIn account not connected or token expired. Please reconnect your account.' },
          { status: 400 }
        );
      }

      try {
        // Publish to LinkedIn with the proper visibility setting
        linkedinPostId = await postToLinkedIn(
          linkedInAccount.access_token,
          content || existingPost.content, // Use updated content or existing content
          (visibility || existingPost.visibility as 'PUBLIC' | 'CONNECTIONS')
        );
        
        linkedinPostUrl = getLinkedInPostUrl(linkedinPostId);
        
        // Create a notification for successful publishing
        await createNotification(
          session.user.id,
          'SCHEDULED_POST_PUBLISHED',
          'Your post was successfully published to LinkedIn!',
          {
            postId: id,
            linkedinPostUrl
          }
        );
      } catch (error) {
        // Create a notification for failed publishing
        await createNotification(
          session.user.id,
          'SCHEDULED_POST_FAILED',
          'Failed to publish your post to LinkedIn.',
          {
            postId: id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
        
        return NextResponse.json(
          { message: error instanceof Error ? error.message : 'Error publishing post' },
          { status: 500 }
        );
      }
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...(content !== undefined && { content }),
        ...(hashtags !== undefined && { hashtags }),
        ...(topicId !== undefined && { topicId }),
        ...(status !== undefined && { status }),
        ...(scheduledFor !== undefined && { scheduledFor: new Date(scheduledFor) }),
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
        ...(visibility !== undefined && { visibility }),
        // Add LinkedIn post details if published
        ...(linkedinPostId && { linkedinPostId, linkedinPostUrl }),
        ...(publish && { status: 'PUBLISHED', publishedAt: new Date() })
      },
    });

    return NextResponse.json({
      ...updatedPost,
      message: publish ? 'Post updated and published to LinkedIn' : 'Post updated successfully',
      linkedinPostUrl: linkedinPostUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error updating post:', error);
    return NextResponse.json(
      { message: 'Error updating post' },
      { status: 500 }
    );
  }
}

// DELETE a post
export async function DELETE(req: NextRequest, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to delete a post' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this post' },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: 'Error deleting post' },
      { status: 500 }
    );
  }
}

// POST - new action for publishing to LinkedIn specifically (alternative to using PUT with publish=true)
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
    
    // Get the request body for optional visibility setting
    let visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC';
    try {
      const body = await req.json();
      if (body.visibility && (body.visibility === 'PUBLIC' || body.visibility === 'CONNECTIONS')) {
        visibility = body.visibility;
      }
    } catch (e) {
      //Default to PUBLIC if body can't be parsed
      console.log(e);
    }
    
    // Publish to LinkedIn
    const linkedinPostId = await postToLinkedIn(
      linkedInAccount.access_token,
      post.content,
      (post.visibility as 'PUBLIC' | 'CONNECTIONS') || visibility
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