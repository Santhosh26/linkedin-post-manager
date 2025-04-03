// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { postToLinkedIn, getLinkedInPostUrl, postWithImageToLinkedIn } from '@/lib/services/linkedin';
import { createNotification } from '@/lib/services/notification';

// Define proper param types for Next.js App Router
interface Params {
  id: string;
}

// GET a single post by ID
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access posts' },
        { status: 401 }
      );
    }

    const postId = params.id;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
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

    // Add image data to the response if it exists
    const postWithImage = {
      ...post,
      image: post.imageUrl 
        ? {
            id: post.imageId,
            url: post.imageUrl,
            thumb: post.imageThumb,
            alt: post.imageAlt,
            credit: post.imageCredit
          }
        : null
    };

    return NextResponse.json(postWithImage);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { message: 'Error fetching post' },
      { status: 500 }
    );
  }
}

// PUT - update a post
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update a post' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const body = await req.json();
    
    console.log('Received update request with body:', body); // Debug log
    
    const { content, hashtags, topicId, status, scheduledFor, publish, visibility, image } = body;

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
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

    // LinkedIn publishing logic (existing code)
    const linkedinPostId = existingPost.linkedinPostId;
    const linkedinPostUrl = existingPost.linkedinPostUrl;
    
    // Start by creating an update data object using Prisma's type
    const updateData: Prisma.PostUpdateInput = {};

    // Add properties conditionally, ensuring they match Prisma's expected types
    if (content !== undefined) updateData.content = content;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
  
    if (status !== undefined) updateData.status = status;
    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    }
    if (status === 'PUBLISHED') updateData.publishedAt = new Date();
    if (visibility !== undefined) updateData.visibility = visibility;

    // LinkedIn details
    if (linkedinPostId) {
      updateData.linkedinPostId = linkedinPostId;
      updateData.linkedinPostUrl = linkedinPostUrl;
    }

    if (publish) {
      updateData.status = 'PUBLISHED';
      updateData.publishedAt = new Date();
    }

    // Handle image data
    if (image) {
      updateData.imageId = image.id;
      updateData.imageUrl = image.url;
      updateData.imageThumb = image.thumb;
      updateData.imageAlt = image.alt || '';
      updateData.imageCredit = image.credit;
    } else if (image === null) {
      // Explicitly check for null to handle image removal
      updateData.imageId = null;
      updateData.imageUrl = null;
      updateData.imageThumb = null;
      updateData.imageAlt = null;
      updateData.imageCredit = Prisma.JsonNull;
    }
    
    console.log('Updating post with data:', updateData); // Debug log

    // Update post
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: updateData,
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
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to delete a post' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
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
        id: postId,
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

// POST - new action for publishing to LinkedIn specifically
export async function POST(
  req: Request, 
  { params }: { params: Params }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to publish a post' },
        { status: 401 }
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
    
    // Get the post with user LinkedIn account
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
                providerAccountId: true,
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

    // Add null check for access_token
    if (!linkedInAccount.access_token) {
      return NextResponse.json(
        { message: 'Invalid LinkedIn access token. Please reconnect your account.' },
        { status: 400 }
      );
    }
    
    // Check if token is valid
    if (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now()) {
      return NextResponse.json(
        { message: 'LinkedIn token expired. Please reconnect your account.' },
        { status: 400 }
      );
    }
    
    console.log('Publishing post to LinkedIn, image URL:', post.imageUrl);
    
    // Determine visibility setting
    const visibilitySetting = (post.visibility as 'PUBLIC' | 'CONNECTIONS') || visibility;
    
    // Publish to LinkedIn - check if we have an image
    let linkedinPostId;
    if (post.imageUrl) {
      // Post with image
      linkedinPostId = await postWithImageToLinkedIn(
        linkedInAccount.access_token,
        post.content,
        {
          url: post.imageUrl,
          alt: post.imageAlt || 'Post image'
        },
        visibilitySetting,
      );
    } else {
      // Post text only
      linkedinPostId = await postToLinkedIn(
        linkedInAccount.access_token,
        post.content,
        visibilitySetting,
      );
    }
    
    const linkedinPostUrl = getLinkedInPostUrl(linkedinPostId);
    
    // Update the post status
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
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
      // Use params.id directly
      const post = await prisma.post.findUnique({
        where: { id: params.id },
        select: { userId: true }
      });
      
      if (post) {
        await createNotification(
          post.userId,
          'SCHEDULED_POST_FAILED',
          'Failed to publish your post to LinkedIn.',
          {
            postId: params.id,
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