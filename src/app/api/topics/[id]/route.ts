// src/app/api/topics/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RequestParams {
  params: {
    id: string;
  };
}

const TopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required'),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
});

// Special handling for the "all" route - creates a new topic
export async function POST(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to create a topic' },
        { status: 401 }
      );
    }

    // If the id is "all", we're creating a new topic
    if (params.id !== "all") {
      return NextResponse.json(
        { message: 'Invalid route for topic creation' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, keywords } = TopicSchema.parse(body);

    const topic = await prisma.topic.create({
      data: {
        name,
        keywords,
        userId: session.user.id,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error creating topic:', error);
    return NextResponse.json(
      { message: 'Error creating topic' },
      { status: 500 }
    );
  }
}

// GET all topics or a specific topic
export async function GET(req: NextRequest, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access topics' },
        { status: 401 }
      );
    }

    // If the id is "all", return all topics for the user
    if (params.id === "all") {
      const topics = await prisma.topic.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return NextResponse.json(topics);
    }

    // Otherwise, fetch a specific topic by ID
    const topic = await prisma.topic.findUnique({
      where: {
        id: params.id,
      },
      include: {
        research: true,
      },
    });

    if (!topic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    // Make sure the topic belongs to the user
    if (topic.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to access this topic' },
        { status: 403 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { message: 'Error fetching topic' },
      { status: 500 }
    );
  }
}

// PUT - update a topic
export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update a topic' },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Can't update the "all" route
    if (id === "all") {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { name, keywords } = TopicSchema.parse(body);

    // Check if topic exists and belongs to user
    const existingTopic = await prisma.topic.findUnique({
      where: {
        id,
      },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    if (existingTopic.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to update this topic' },
        { status: 403 }
      );
    }

    // Update the topic
    const updatedTopic = await prisma.topic.update({
      where: {
        id,
      },
      data: {
        ...(name && { name }),
        ...(keywords && { keywords }),
      },
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }

    console.error('Error updating topic:', error);
    return NextResponse.json(
      { message: 'Error updating topic' },
      { status: 500 }
    );
  }
}

// DELETE a topic
export async function DELETE(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to delete a topic' },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Can't delete the "all" route
    if (id === "all") {
      return NextResponse.json(
        { message: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Check if topic exists and belongs to user
    const existingTopic = await prisma.topic.findUnique({
      where: {
        id,
      },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { message: 'Topic not found' },
        { status: 404 }
      );
    }

    if (existingTopic.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to delete this topic' },
        { status: 403 }
      );
    }

    // Delete the topic
    await prisma.topic.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { message: 'Error deleting topic' },
      { status: 500 }
    );
  }
}