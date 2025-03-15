// src/lib/contexts/UserSettingsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from './ThemeContext';

// Define user settings types
export type PostTone = 'professional' | 'casual' | 'thoughtful';

export type ResearchSource = {
  domain: string;
  priority: number;
  enabled: boolean;
};

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultPostTone: PostTone;
  defaultVariationCount: number;
  defaultMaxResults: number;
  includedSources: ResearchSource[];
  excludedDomains: string[];
}

interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  saveSettings: () => Promise<void>;
}

// Default settings
const defaultSettings: UserSettings = {
  theme: 'system',
  defaultPostTone: 'professional',
  defaultVariationCount: 2,
  defaultMaxResults: 10,
  includedSources: [
    { domain: 'medium.com', priority: 1, enabled: true },
    { domain: 'linkedin.com', priority: 2, enabled: true },
    { domain: 'techcrunch.com', priority: 3, enabled: true },
    { domain: 'forbes.com', priority: 4, enabled: true },
    { domain: 'hbr.org', priority: 5, enabled: true },
  ],
  excludedDomains: []
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings when session is available
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        // For unauthenticated users, just use default settings
        // but sync the theme with the current ThemeContext
        const settingsWithCurrentTheme = {
          ...defaultSettings,
          theme: theme as 'light' | 'dark'
        };
        setSettings(settingsWithCurrentTheme);
        setOriginalSettings(settingsWithCurrentTheme);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user settings');
        }
        
        const data = await response.json();
        
        // If user has no saved settings yet, use defaults
        const userSettings = data.settings || {
          ...defaultSettings,
          theme: theme as 'light' | 'dark'
        };
        
        setSettings(userSettings);
        setOriginalSettings(userSettings);
      } catch (err) {
        console.error('Error fetching user settings:', err);
        setError('Failed to load settings. Using defaults.');
        
        // Fall back to default settings
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [session, status]);

  // Update a single setting
  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    
    // If we're updating the theme setting, also update the ThemeContext
    if (key === 'theme' && value !== settings.theme) {
      const newTheme = value === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : value as 'light' | 'dark';
        
      if (newTheme !== theme) {
        toggleTheme();
      }
    }
    
    setSettings({
      ...settings,
      [key]: value
    });
  };

  // Save all settings to the database
  const saveSettings = async () => {
    if (!session || !settings) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Update the original settings after successful save
      setOriginalSettings(settings);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateSetting,
        saveSettings,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};