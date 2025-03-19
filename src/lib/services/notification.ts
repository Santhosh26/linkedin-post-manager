// src/lib/services/notification.ts
import { prisma } from '@/lib/prisma';

export type NotificationType = 'SCHEDULED_POST_FAILED' | 'SCHEDULED_POST_PUBLISHED' | 'SYSTEM';

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        metadata: metadata || {},
        read: false
      }
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  } catch (err) {
    console.error('Failed to get unread notifications count:', err);
    return 0;
  }
}

export async function getUserNotifications(userId: string, limit = 10): Promise<any[]> {
  try {
    return await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  } catch (err) {
    console.error('Failed to get user notifications:', err);
    return [];
  }
}