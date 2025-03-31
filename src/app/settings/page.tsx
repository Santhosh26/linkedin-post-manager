// src/app/settings/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import ProfileSection from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import ContentPreferencesSection from '@/components/settings/ContentPreferencesSection';
import ResearchPreferencesSection from '@/components/settings/ResearchPreferencesSection';
import LinkedInSection from '@/components/settings/LinkedInSection';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';

// Define metadata for each tab to support search
interface TabInfo {
  id: string;
  label: string;
  keywords: string[]; // Keywords to match in search
}

export default function SettingsPage() {
  const { isLoading, error } = useUserSettings();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Update active tab based on URL query parameter
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter tabs based on search query
  const filteredTabs = useMemo(() => {
    // Define tabs with keywords inside useMemo to prevent recreation on every render
    const tabs: TabInfo[] = [
      { 
        id: 'profile', 
        label: 'Profile', 
        keywords: ['profile', 'user', 'name', 'email', 'avatar', 'personal', 'information', 'bio']
      },
      { 
        id: 'security', 
        label: 'Security', 
        keywords: ['security', 'password', 'two-factor', '2fa', 'authentication', 'login', 'protection']
      },
      { 
        id: 'appearance', 
        label: 'Appearance', 
        keywords: ['appearance', 'theme', 'dark mode', 'light mode', 'colors', 'layout', 'display', 'ui', 'design']
      },
      { 
        id: 'content', 
        label: 'Content Preferences', 
        keywords: ['content', 'preferences', 'feed', 'posts', 'tone', 'professional', 'casual', 'thoughtful']
      },
      { 
        id: 'research', 
        label: 'Research Settings', 
        keywords: ['research', 'sources', 'domains', 'results', 'priority', 'linkedin', 'forbes', 'hbr', 'excluded']
      },
      { 
        id: 'linkedin', 
        label: 'LinkedIn Integration', 
        keywords: ['linkedin', 'integration', 'social', 'network', 'connection', 'professional', 'share', 'post']
      },
    ];

    if (!searchQuery.trim()) return tabs;
    
    const query = searchQuery.toLowerCase().trim();
    return tabs.filter(tab => {
      return (
        tab.label.toLowerCase().includes(query) || 
        tab.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  // If we have a search query but no matching tabs are found
  const noSearchResults = searchQuery.trim() !== '' && filteredTabs.length === 0;
  
  // Get access to the tabs for other parts of the component
  const allTabs = filteredTabs;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // If we have results and active tab isn't in filtered results, auto-select first result
    if (filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(filteredTabs[0].id);
    }
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection />;
      case 'security':
        return <SecuritySection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'content':
        return <ContentPreferencesSection />;
      case 'research':
        return <ResearchPreferencesSection />;
      case 'linkedin':
        return <LinkedInSection />;
      default:
        return <ProfileSection />;
    }
  };

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
          {/* Sidebar navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Search box */}
            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                         bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary
                         focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-500">✕</span>
                </button>
              )}
            </div>

            {/* No results message */}
            {noSearchResults ? (
              <div className="text-center py-8 px-4 text-gray-500 dark:text-gray-400">
                <p>No settings found for &quot;{searchQuery}&quot;</p>
                <button 
                  onClick={clearSearch}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <nav className="flex flex-col">
                    {allTabs.map((tab) => (
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
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 relative">
            <div className={`${isLoading ? 'opacity-50' : ''}`}>
              {renderContent()}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center absolute inset-0 bg-white/50 dark:bg-black/50 z-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}