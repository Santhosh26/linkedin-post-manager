// src/app/api/notifications/[id]/read/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RequestParams {
  params: {
    id: string;
  };
}

export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    });
    
    if (!notification) {
      return NextResponse.json(
        { message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await prisma.notification.update({
      where: { id: params.id },
      data: { read: true }
    });
    
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { message: 'Error marking notification as read' },
      { status: 500 }
    );
  }
}