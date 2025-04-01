// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      linkedinConnected?: boolean;
    } & DefaultSession["user"];
    linkedinAccessToken?: string;
    linkedinRefreshToken?: string;
    linkedinTokenExpiry?: number;
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    linkedinAccessToken?: string;
    linkedinRefreshToken?: string;
    linkedinTokenExpiry?: number;
  }
}