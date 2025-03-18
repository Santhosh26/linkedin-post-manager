// src/lib/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage if available, otherwise use system preference
  const [theme, setThemeState] = useState<Theme>('light');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize theme only once when component mounts
  useEffect(() => {
    // Only run this effect once on initial client-side render
    if (typeof window === 'undefined' || !isInitializing) return;
    
    try {
      // On mount, read from localStorage or detect system preference
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
      }
    } catch (error) {
      // Fallback if localStorage is unavailable
      console.error('Failed to read theme from localStorage:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  // Apply theme classes to document when theme changes
  useEffect(() => {
    if (isInitializing) return;
    
    // Apply theme classes to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update CSS variables based on theme
    document.documentElement.style.setProperty('--background', theme === 'dark' ? '#121212' : '#ffffff');
    document.documentElement.style.setProperty('--foreground', theme === 'dark' ? '#f0f0f0' : '#1a1a1a');
    
    // Apply other CSS variables from globals.css directly via javascript to ensure they're updated
    const variables = theme === 'dark' 
      ? {
          '--card-bg': '#1e1e1e', 
          '--card-border': '#2a2a2a',
          '--input-bg': '#2a2a2a',
          '--input-text': '#f0f0f0',
          '--input-border': '#3f3f3f',
          '--input-focus-border': '#0071fe',
          '--input-placeholder': '#6b7280',
          '--button-bg': '#0071fe',
          '--button-hover': '#005bca',
          '--button-text': '#ffffff',
          '--secondary-button-bg': '#2a2a2a',
          '--secondary-button-hover': '#3f3f3f',
          '--secondary-button-text': '#f0f0f0',
          '--outline-button-border': '#3f3f3f',
          '--outline-button-hover': '#2a2a2a',
          '--outline-button-text': '#f0f0f0',
          '--nav-bg': '#121212',
          '--nav-border': '#2a2a2a',
          '--sidebar-bg': '#1a1a1a',
          '--sidebar-border': '#2a2a2a',
          '--sidebar-hover': '#2a2a2a',
          '--sidebar-active': '#1e2a3a',
          '--sidebar-active-text': '#3b82f6',
          '--table-header-bg': '#1e1e1e',
          '--table-border': '#2a2a2a',
          '--table-row-hover': '#1a1a1a'
        }
      : {
          '--card-bg': '#ffffff',
          '--card-border': '#e5e7eb',
          '--input-bg': '#ffffff',
          '--input-text': '#1a1a1a',
          '--input-border': '#d1d5db',
          '--input-focus-border': '#0071fe',
          '--input-placeholder': '#9ca3af',
          '--button-bg': '#0071fe',
          '--button-hover': '#005bca',
          '--button-text': '#ffffff',
          '--secondary-button-bg': '#f3f4f6',
          '--secondary-button-hover': '#e5e7eb',
          '--secondary-button-text': '#1f2937',
          '--outline-button-border': '#d1d5db',
          '--outline-button-hover': '#f3f4f6',
          '--outline-button-text': '#1f2937',
          '--nav-bg': '#ffffff',
          '--nav-border': '#e5e7eb',
          '--sidebar-bg': '#ffffff',
          '--sidebar-border': '#e5e7eb',
          '--sidebar-hover': '#f3f4f6',
          '--sidebar-active': '#e6f1ff',
          '--sidebar-active-text': '#0071fe',
          '--table-header-bg': '#f9fafb',
          '--table-border': '#e5e7eb',
          '--table-row-hover': '#f9fafb'
        };
    
    // Apply all variables
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    
    try {
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
    
    // Dispatch a custom event to notify components of theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }, [theme, isInitializing]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}