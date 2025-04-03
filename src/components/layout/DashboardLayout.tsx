// components/layout/DashboardLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login?redirect=' + encodeURIComponent(window.location.pathname));
    return null;
  }

  return (
    <div className="min-h-screen bg-background ">
      <Navbar />
      <div className="flex">
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <Sidebar />
        </div>
        <main className="md:ml-64 flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;