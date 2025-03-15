// src/app/api/topics/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const TopicSchema = z.object({
  name: z.string().min(1, 'Topic name is required'),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
});

// GET all topics for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access topics' },
        { status: 401 }
      );
    }

    const topics = await prisma.topic.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { message: 'Error fetching topics' },
      { status: 500 }
    );
  }
}

// POST - create a new topic
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to create a topic' },
        { status: 401 }
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