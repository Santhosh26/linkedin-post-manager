// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed to Inter from Roboto
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}