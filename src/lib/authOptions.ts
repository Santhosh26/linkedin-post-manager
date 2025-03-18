// src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import LinkedInProvider from "next-auth/providers/linkedin";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { refreshLinkedInToken } from "@/lib/services/linkedin";

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
          // CRITICAL: Use exactly these scopes to match what you've selected in LinkedIn UI
          scope: "openid email profile w_member_social",
        },
      },
      // Leave the profile function as it is - it's fine for now
      profile(profile) {
        console.log("LinkedIn OAuth profile data:", JSON.stringify(profile, null, 2));
        return {
          id: profile.id,
          name: profile.localizedFirstName && profile.localizedLastName 
            ? `${profile.localizedFirstName} ${profile.localizedLastName}`
            : 'LinkedIn User', 
          email: null, 
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
          console.log('Adding LinkedIn token to JWT');
          token.linkedinAccessToken = account.access_token;
          token.linkedinRefreshToken = account.refresh_token;
          token.linkedinTokenExpiry = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600000; // Default 1 hour
        }
        token.id = user.id;
      }
      
      // Check if LinkedIn token is expired and needs refreshing
      if (token.linkedinAccessToken && token.linkedinRefreshToken && 
          token.linkedinTokenExpiry && Date.now() >= token.linkedinTokenExpiry) {
        try {
          console.log('LinkedIn token expired, attempting to refresh...');
          const newToken = await refreshLinkedInToken(token.linkedinRefreshToken as string);
          
          if (newToken) {
            console.log('LinkedIn token refreshed successfully');
            token.linkedinAccessToken = newToken.accessToken;
            token.linkedinTokenExpiry = newToken.expiresAt;
            // Update refresh token if provided
            if (newToken.refreshToken) {
              token.linkedinRefreshToken = newToken.refreshToken;
            }
          } else {
            console.log('LinkedIn token refresh failed, clearing token data');
            // Clear tokens to force re-authentication
            delete token.linkedinAccessToken;
            delete token.linkedinRefreshToken;
            delete token.linkedinTokenExpiry;
          }
        } catch (error) {
          console.error('Error refreshing LinkedIn token:', error);
          // Clear tokens on error to force re-authentication
          delete token.linkedinAccessToken;
          delete token.linkedinRefreshToken;
          delete token.linkedinTokenExpiry;
        }
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
        session.linkedinRefreshToken = token.linkedinRefreshToken;
        session.linkedinTokenExpiry = token.linkedinTokenExpiry;
      }
      return session;
    },
  },
};