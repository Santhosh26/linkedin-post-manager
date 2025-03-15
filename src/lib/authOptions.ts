// src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import LinkedInProvider from "next-auth/providers/linkedin";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
          
          // If user doesn't exist or doesn't have a password
          if (!user || !user.password) return null;
          
          const isPasswordValid = await compare(credentials.password as string, user.password);
          if (!isPasswordValid) return null;
          
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            image: user.image 
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "r_emailaddress r_liteprofile w_member_social",
        },
      },
      // Be explicit about the OAuth profile response
      profile(profile) {
        return {
          id: profile.id,
          name: profile.localizedFirstName + " " + profile.localizedLastName,
          email: profile.emailAddress,
          image: profile.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]?.identifier || null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Add LinkedIn token data to the JWT if available
        if (account.provider === 'linkedin') {
          token.linkedinAccessToken = account.access_token;
          token.linkedinRefreshToken = account.refresh_token;
          token.linkedinTokenExpiry = account.expires_at ? account.expires_at * 1000 : 0;
        }
        token.id = user.id;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          
          // Add LinkedIn connection status to the session
          session.user.linkedinConnected = !!token.linkedinAccessToken;
        }
        
        // Store LinkedIn tokens in session
        session.linkedinAccessToken = token.linkedinAccessToken;
      }
      return session;
    },
  },
};