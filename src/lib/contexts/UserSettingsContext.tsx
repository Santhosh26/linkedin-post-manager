'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PostTone = 'professional' | 'casual' | 'thoughtful';

export interface ResearchSource {
  domain: string;
  priority: number;
  enabled: boolean;
}

export interface UserSettings {
  defaultPostTone: PostTone;
  defaultVariationCount: number;
  defaultMaxResults: number;
  includedSources: ResearchSource[];
  excludedDomains: string[];
}

const defaultSettings: UserSettings = {
  defaultPostTone: 'professional',
  defaultVariationCount: 2,
  defaultMaxResults: 10,
  includedSources: [
    { domain: 'linkedin.com', priority: 1, enabled: true },
    { domain: 'hbr.org', priority: 2, enabled: true },
    { domain: 'forbes.com', priority: 3, enabled: true },
  ],
  excludedDomains: ['pinterest.com', 'facebook.com'],
};

interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  saveSettings: () => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch from API
        // const response = await fetch('/api/settings');
        // const data = await response.json();
        
        // Simulate API response with a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use default settings for now
        setSettings(defaultSettings);
        setError(null);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
        // Fall back to defaults if there's an error
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update a single setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value
    });
  };

  // Save settings to API
  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, save to API
      // const response = await fetch('/api/settings', {
      //  method: 'PUT',
      //  headers: {
      //    'Content-Type': 'application/json',
      //  },
      //  body: JSON.stringify(settings),
      // });
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      setError(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, isLoading, error, updateSetting, saveSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}