// src/lib/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

// Define session types to include LinkedIn tokens
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      linkedinConnected?: boolean;
    };
    linkedinAccessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    linkedinAccessToken?: string;
    linkedinRefreshToken?: string;
    linkedinTokenExpiry?: number;
  }
}

// Export the handlers so they can be used in the API routes
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);