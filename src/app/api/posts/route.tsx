// src/app/api/posts/route.tsx
import { NextResponse } from 'next/server';
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
});

// GET all posts for the current user
export async function GET(req: Request) {
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

    // Build the query
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
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to create a post' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, hashtags = [], topicId, status = 'DRAFT', scheduledFor } = CreatePostSchema.parse(body);

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

// Generate posts from research
export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to generate posts' },
        { status: 401 }
      );
    }

    const body = await req.json();
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
    return NextResponse.json(
      { message: 'Error generating posts' },
      { status: 500 }
    );
  }
}