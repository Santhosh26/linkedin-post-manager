// src/app/api/linkedin/disconnect/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE - Disconnect LinkedIn account
 */
export async function DELETE(req: Request) {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to disconnect your LinkedIn account' },
        { status: 401 }
      );
    }

    // Delete LinkedIn provider accounts for this user
    await prisma.account.deleteMany({
      where: { 
        userId: session.user.id,
        provider: 'linkedin'
      },
    });

    return NextResponse.json({
      message: 'LinkedIn account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn account:', error);
    return NextResponse.json(
      { message: 'Error disconnecting LinkedIn account' },
      { status: 500 }
    );
  }
}