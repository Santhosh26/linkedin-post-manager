// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import ProfileSection from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import ContentPreferencesSection from '@/components/settings/ContentPreferencesSection';
import ResearchPreferencesSection from '@/components/settings/ResearchPreferencesSection';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { isLoading, error } = useUserSettings();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'content', label: 'Content Preferences' },
    { id: 'research', label: 'Research Settings' },
  ];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Settings</h1>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`text-left px-4 py-3 border-l-4 ${
                        activeTab === tab.id
                          ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
            
            {/* Quick Settings Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search settings..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                         bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary
                         focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600"
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className={`${isLoading ? 'opacity-50' : ''}`}>
              {/* Profile Section */}
              {activeTab === 'profile' && <ProfileSection />}
              
              {/* Security Section */}
              {activeTab === 'security' && <SecuritySection />}
              
              {/* Appearance Section */}
              {activeTab === 'appearance' && <AppearanceSection />}
              
              {/* Content Preferences Section */}
              {activeTab === 'content' && <ContentPreferencesSection />}
              
              {/* Research Settings Section */}
              {activeTab === 'research' && <ResearchPreferencesSection />}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center absolute inset-0 bg-white/50 dark:bg-black/50 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}