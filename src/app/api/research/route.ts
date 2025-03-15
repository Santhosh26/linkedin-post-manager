// src/app/api/research/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchContent } from '@/lib/services/tavily';
import { auth } from '@/lib/auth';

const ResearchSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  query: z.string().min(3, 'Search query must be at least 3 characters'),
  maxResults: z.number().int().min(1).max(20).optional(),
});

// POST - conduct research and save results
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to conduct research' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { topicId, query, maxResults = 10 } = ResearchSchema.parse(body);

    // Verify that the topic exists and belongs to the user
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

    // Conduct research using Tavily API
    const researchResults = await searchContent({
      query,
      max_results: maxResults,
      search_depth: 'advanced',
    });

    // Save research results
    const savedResearch = await prisma.research.create({
      data: {
        topicId,
        content: researchResults,
      },
    });

    return NextResponse.json({
      id: savedResearch.id,
      results: researchResults,
      message: 'Research completed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Research error:', error);
    return NextResponse.json(
      { message: 'Error conducting research' },
      { status: 500 }
    );
  }
}

// GET - retrieve saved research by topicId
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access research results' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json(
        { message: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Verify that the topic belongs to the user
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

    // Get research results for the topic
    const researchResults = await prisma.research.findMany({
      where: {
        topicId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(researchResults);
  } catch (error) {
    console.error('Error retrieving research results:', error);
    return NextResponse.json(
      { message: 'Error retrieving research results' },
      { status: 500 }
    );
  }
}