// src/lib/auth.ts
import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

// Export the handlers so they can be used in the API routes
export const { handlers, auth, signIn, signOut, update } = NextAuth(authOptions);