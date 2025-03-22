// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateLinkedInPosts } from '@/lib/services/openai';

// Schema for generating new posts
const GeneratePostSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  researchId: z.string().min(1, 'Research ID is required'),
  tone: z.enum(['professional', 'casual', 'thoughtful']).optional(),
  variationCount: z.number().int().min(1).max(5).optional(),
});

// Schema for creating a new post
const CreatePostSchema = z.object({
  content: z.string().min(10, 'Post content is required'),
  hashtags: z.array(z.string()).optional(),
  topicId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
  scheduledFor: z.string().optional(), // ISO string date
  visibility: z.enum(['PUBLIC', 'CONNECTIONS']).optional(),
});

// GET all posts for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access posts' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // If an ID is provided, get a specific post
    if (id) {
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
    }

    // Build the query for listing posts
    const where: {
      userId: string;
      topicId?: string;
      status?: string;
    } = {
      userId: session.user.id,
    };

    if (topicId) {
      where.topicId = topicId;
    }

    if (status) {
      where.status = status;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        topic: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { message: 'Error fetching posts' },
      { status: 500 }
    );
  }
}

// POST - create a new post
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to create a post' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Check if we're generating posts or creating a regular post
    const action = new URL(req.url).searchParams.get('action');
    
    if (action === 'generate') {
      return handleGeneratePosts(session, body);
    }

    // Standard post creation
    const { content, hashtags = [], topicId, status = 'DRAFT', scheduledFor, visibility = 'PUBLIC' } = CreatePostSchema.parse(body);

    // If topicId is provided, verify it exists and belongs to the user
    if (topicId) {
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

    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        hashtags,
        status,
        topicId,
        userId: session.user.id,
        visibility,
        ...(scheduledFor && { scheduledFor: new Date(scheduledFor) }),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Error creating post' },
      { status: 500 }
    );
  }
}

// Handler for generating posts from research
async function handleGeneratePosts(session: any, body: any) {
  try {
    const { topicId, researchId, tone = 'professional', variationCount = 2 } = GeneratePostSchema.parse(body);

    // Verify topic exists and belongs to user
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

    // Get research data
    const research = await prisma.research.findUnique({
      where: {
        id: researchId,
      },
    });

    if (!research) {
      return NextResponse.json(
        { message: 'Research not found' },
        { status: 404 }
      );
    }

    if (research.topicId !== topicId) {
      return NextResponse.json(
        { message: 'Research does not belong to the specified topic' },
        { status: 400 }
      );
    }

    // Generate posts
    const postVariations = await generateLinkedInPosts({
      topic: topic.name,
      researchData: research.content,
      tone,
      variationCount,
    });

    // Save generated posts
    const savedPosts = await Promise.all(
      postVariations.map((variation) =>
        prisma.post.create({
          data: {
            content: variation.content,
            hashtags: variation.hashtags,
            topicId,
            userId: session.user.id,
            status: 'DRAFT',
          },
        })
      )
    );

    return NextResponse.json({
      posts: savedPosts,
      message: 'Posts generated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error generating posts:', error);
    throw error; // Re-throw to be caught by the outer handler
  }
}