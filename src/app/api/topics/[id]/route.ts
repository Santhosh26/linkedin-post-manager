// src/app/api/topics/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

const TopicUpdateSchema = z.object({
  name: z.string().min(1, 'Topic name is required').optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required').optional(),
});

// GET a single topic by ID
export async function GET(req: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access topics' },
        { status: 401 }
      );
    }

    // In App Router, params is already resolved when the handler is called
    const id = params.id;

    const topic = await prisma.topic.findUnique({
      where: {
        id,
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
export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update a topic' },
        { status: 401 }
      );
    }

    const id = params.id;
    const body = await req.json();
    const { name, keywords } = TopicUpdateSchema.parse(body);

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
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to delete a topic' },
        { status: 401 }
      );
    }

    const id = params.id;

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