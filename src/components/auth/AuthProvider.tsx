// src/components/auth/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ResearchProvider } from '@/lib/contexts/ResearchContext';

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <ResearchProvider>
        {children}
      </ResearchProvider>
    </SessionProvider>
  );
}