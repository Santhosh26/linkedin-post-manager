// src/components/auth/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ResearchProvider } from '@/lib/contexts/ResearchContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { UserSettingsProvider } from '@/lib/contexts/UserSettingsContext';

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserSettingsProvider>
          <ResearchProvider>
            {children}
          </ResearchProvider>
        </UserSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}