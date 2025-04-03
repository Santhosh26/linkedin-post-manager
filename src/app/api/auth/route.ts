// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Schema for user registration
const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});



// Schema for password change
const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// GET - Check authentication status or session information
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    // Common response with authenticated status
    const baseResponse = {
      authenticated: !!session,
      session,
    };
    
    // Handle different session-related actions
    switch (action) {
      case 'providers':
        // Return only providers info (simplified version)
        return NextResponse.json({
          ...baseResponse,
          providers: ['credentials', 'linkedin'] // This is simplified; in a real app you'd get from authOptions
        });
      default:
        // Default case - just return basic session info
        return NextResponse.json(baseResponse);
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Authentication error' },
      { status: 500 }
    );
  }
}

// POST - Handle user registration, login or other auth actions
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const body = await req.json();
    
    // Determine the action based on query parameter
    switch (action) {
      case 'register':
        return handleRegistration(body);
      case 'password':
        return handlePasswordChange(body);
      default:
        // Default case - return error for unknown action
        return NextResponse.json(
          { message: 'Unknown auth action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    
    return NextResponse.json(
      { message: 'Authentication error' },
      { status: 500 }
    );
  }
}

// Helper function to handle user registration
async function handleRegistration(body: any) {
  try {
    const { email, name, password } = RegisterSchema.parse(body);

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return the user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { user: userWithoutPassword, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    throw error;
  }
}

// Helper function to handle password changes
async function handlePasswordChange(body: any) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to update your password' },
        { status: 401 }
      );
    }
    
    const { currentPassword, newPassword } = PasswordChangeSchema.parse(body);

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'User not found or password not set' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    throw error;
  }
}