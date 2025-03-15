// src/app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface Params {
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
});

// GET a single post by ID
export async function GET(req: Request, { params }: Params) {
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
export async function PUT(req: Request, { params }: Params) {
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
    const { content, hashtags, topicId, status, scheduledFor } = PostUpdateSchema.parse(body);

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
      },
    });

    return NextResponse.json(updatedPost);
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
export async function DELETE(req: Request, { params }: Params) {
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