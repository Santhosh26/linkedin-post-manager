// src\components\ui\ThemeToggle.tsx

'use client';

import React, { useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting, saveSettings } = useUserSettings();

  // Keep settings in sync with theme toggle changes
  useEffect(() => {
    if (settings && settings.theme !== 'system' && settings.theme !== theme) {
      // Update settings when theme changes via toggle
      updateSetting('theme', theme);
      // Save settings to persist the change
      saveSettings();
    }
  }, [theme, settings, updateSetting, saveSettings]);

  const handleToggle = () => {
    // Toggle the theme
    toggleTheme();
    
    // Force reflow to ensure consistent style application
    document.body.classList.add('theme-transitioning');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <FiMoon className="h-5 w-5" />
      ) : (
        <FiSun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;