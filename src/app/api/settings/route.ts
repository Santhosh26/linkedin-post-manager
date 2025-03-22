// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const SettingsSchema = z.object({
  defaultPostTone: z.enum(['professional', 'casual', 'thoughtful']),
  defaultVariationCount: z.number().int().min(1).max(5),
  defaultMaxResults: z.number().int().min(1).max(20),
  includedSources: z.array(
    z.object({
      domain: z.string(),
      priority: z.number().int(),
      enabled: z.boolean(),
    })
  ),
  excludedDomains: z.array(z.string()),
});

// GET - retrieve user settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to access settings' },
        { status: 401 }
      );
    }

    // Try to find existing settings for the user
    const existingSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingSettings) {
      return NextResponse.json({ settings: null });
    }

    // Parse the JSON settings
    const settings = existingSettings.settings as object;

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error retrieving user settings:', error);
    return NextResponse.json(
      { message: 'Error retrieving user settings' },
      { status: 500 }
    );
  }
}

// PUT - update user settings
export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update settings' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { settings } = body;

    // Validate settings
    SettingsSchema.parse(settings);

    // Update or create settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        settings: settings as any,
      },
      create: {
        userId: session.user.id,
        settings: settings as any,
      },
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings.settings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { message: 'Error updating user settings' },
      { status: 500 }
    );
  }
}