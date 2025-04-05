// src/components/layout/ClientDashboardLayout.tsx
'use client'; // Keep this

import React, { ReactNode } from 'react';
// REMOVE useSession and redirect imports
import Navbar from './Navbar';
import Sidebar from './Sidebar';
// REMOVE Loader2 import if only used for loading state

interface ClientDashboardLayoutProps {
  children: ReactNode;
}

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ children }) => {
  // REMOVE ALL useSession HOOK LOGIC AND REDIRECTS
  // if (status === 'loading') { ... }
  // if (status === 'unauthenticated') { ... }

  // Keep only the layout structure
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
              {/* The Card wrapper might move to the server layout or page */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboardLayout;