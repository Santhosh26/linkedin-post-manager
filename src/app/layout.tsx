// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed to Inter from Roboto
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Define the font with a proper fallback
const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'LinkedIn Post Manager',
  description: 'Streamline your LinkedIn content workflow from research to scheduling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body className={`${inter.className} h-full antialiased`}>
    <ThemeProvider
          storageKey="linkedin-post-manager-theme" // Optional: customize storage key
          defaultTheme="system" // This is accepted
        >
      <AuthProvider>{children}</AuthProvider>
      <Toaster />
      </ThemeProvider>
    </body>
  </html>
  );
}