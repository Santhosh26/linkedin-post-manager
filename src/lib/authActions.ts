'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from './auth';
import { AuthError } from 'next-auth';

export async function login(credentials: { email: string; password: string; }) {
  try {
    await nextAuthSignIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    }
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
}

export async function logout() {
  await nextAuthSignOut();
  return { success: true };
}