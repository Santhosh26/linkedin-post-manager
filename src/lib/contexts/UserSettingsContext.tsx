// src/lib/contexts/UserSettingsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
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

export const UserSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state to track pending changes
  const [isDirty, setIsDirty] = useState(false);
  
  // Ref to prevent circular theme updates
  const isUpdatingFromTheme = useRef(false);
  
  // Ref to track initialization
  const isInitialized = useRef(false);

  // Fetch settings only once on initialization
  useEffect(() => {
    if (status === 'loading' || isInitialized.current) return;
    
    const fetchUserSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!session) {
          // Use default settings for non-authenticated users
          const defaultWithTheme = {
            ...defaultSettings,
            theme: theme as 'light' | 'dark'
          };
          setSettings(defaultWithTheme);
          setOriginalSettings(defaultWithTheme);
          isInitialized.current = true;
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/api/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user settings');
        }
        
        const data = await response.json();
        
        // If user has settings, use them; otherwise use defaults
        const userSettings = data.settings || {
          ...defaultSettings,
          theme: theme as 'light' | 'dark'
        };
        
        // Apply theme from settings only once during initialization
        if (userSettings.theme !== 'system' && userSettings.theme !== theme) {
          isUpdatingFromTheme.current = true;
          setTheme(userSettings.theme);
          isUpdatingFromTheme.current = false;
        }
        
        setSettings(userSettings);
        setOriginalSettings(userSettings);
      } catch (err) {
        console.error('Error fetching user settings:', err);
        setError('Failed to load settings. Using defaults.');
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    fetchUserSettings();
  }, [session, status, theme, setTheme]);

  // Handle theme changes with debouncing
  useEffect(() => {
    // Skip if settings not initialized or if we're updating from a theme context change
    if (!settings || !isInitialized.current || isUpdatingFromTheme.current) return;
    
    // Only update if theme has changed
    if (settings.theme !== theme && settings.theme !== 'system') {
      setSettings(prev => ({
        ...prev!,
        theme: theme as 'light' | 'dark'
      }));
      
      // Mark as dirty but don't save immediately
      setIsDirty(true);
    }
  }, [theme, settings]);

  // Debounced save effect
  useEffect(() => {
    if (!isDirty || !session) return;
    
    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 2000); // 2 second debounce
    
    return () => clearTimeout(timeoutId);
  }, [isDirty, session]);

  // Update a single setting without immediately saving
  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    
    // If updating theme, update ThemeContext too, but prevent circular updates
    if (key === 'theme' && value !== settings.theme) {
      const newTheme = value === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : value as 'light' | 'dark';
      
      // Prevent circular updates by flagging
      isUpdatingFromTheme.current = true;
      setTheme(newTheme);
      isUpdatingFromTheme.current = false;
    }
    
    setSettings(prev => ({
      ...prev!,
      [key]: value
    }));
    
    // Mark as dirty but don't save immediately
    setIsDirty(true);
  }, [settings, setTheme]);

  // Save settings to API with throttling
  const saveSettings = useCallback(async () => {
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
      
      // Update original settings after successful save
      setOriginalSettings(settings);
      setIsDirty(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [session, settings]);

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