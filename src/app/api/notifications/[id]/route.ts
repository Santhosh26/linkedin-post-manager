// src/app/api/notifications/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RequestParams {
  params: {
    id: string;
  };
}

// GET - fetch a specific notification
export async function GET(req: Request, { params }: RequestParams) {
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
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { message: 'Error fetching notification' },
      { status: 500 }
    );
  }
}

// PUT - mark a notification as read or mark all notifications as read
export async function PUT(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Special case for marking all notifications as read
    if (params.id === 'all') {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: {
          read: true
        }
      });
      
      return NextResponse.json({ message: 'All notifications marked as read' });
    }
    
    // Regular case for marking a single notification as read
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
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Error updating notification' },
      { status: 500 }
    );
  }
}

// DELETE - delete a notification or all notifications
export async function DELETE(req: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Special case for deleting all notifications
    if (params.id === 'all') {
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id
        }
      });
      
      return NextResponse.json({ message: 'All notifications deleted' });
    }
    
    // Regular case for deleting a single notification
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
    
    await prisma.notification.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { message: 'Error deleting notification' },
      { status: 500 }
    );
  }
}