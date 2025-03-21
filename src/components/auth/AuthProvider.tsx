// src/components/auth/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ResearchProvider } from '@/lib/contexts/ResearchContext';
import { UserSettingsProvider } from '@/lib/contexts/UserSettingsContext';

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <UserSettingsProvider>
        <ResearchProvider>
          {children}
        </ResearchProvider>
      </UserSettingsProvider>
    </SessionProvider>
  );
}