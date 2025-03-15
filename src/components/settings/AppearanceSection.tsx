// src/components/settings/AppearanceSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMonitor, FiCheckCircle } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function AppearanceSection() {
  const { settings, updateSetting, saveSettings, isLoading, error } = useUserSettings();
  const { setTheme } = useTheme(); // Direct access to setTheme
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (!settings || settings.theme === theme) return;
    
    // Update the theme state directly in ThemeContext
    // If system preference, check and apply accordingly
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(theme);
    }
    
    // Update the settings context
    updateSetting('theme', theme);
    setIsDirty(true);
  };

  const handleSave = async () => {
    await saveSettings();
    setSuccess('Appearance settings saved successfully');
    setIsDirty(false);
    
    // Force refresh styles to ensure consistent application
    document.documentElement.classList.remove('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.add('theme-transitioning');
    }, 10);
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader title="Appearance Settings" />
      <CardContent>
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary mb-4">Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleThemeChange('light')}
              >
                <div className="flex justify-center mb-3">
                  <FiSun className="h-8 w-8 text-orange-500 dark:text-yellow-400" />
                </div>
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">Light Mode</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Use light theme for the interface
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleThemeChange('dark')}
              >
                <div className="flex justify-center mb-3">
                  <FiMoon className="h-8 w-8 text-indigo-500 dark:text-blue-400" />
                </div>
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">Dark Mode</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Use dark theme for the interface
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.theme === 'system'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleThemeChange('system')}
              >
                <div className="flex justify-center mb-3">
                  <FiMonitor className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">System</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Match your system's appearance settings
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary mb-4">Font Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Font Size
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 
                            bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary
                            focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-600 
                            focus:border-primary-500 dark:focus:border-primary-600 
                            sm:text-sm rounded-md transition-colors"
                  defaultValue="medium"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                  Font Family
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 
                            bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary
                            focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-600 
                            focus:border-primary-500 dark:focus:border-primary-600 
                            sm:text-sm rounded-md transition-colors"
                  defaultValue="roboto"
                >
                  <option value="roboto">Roboto (Default)</option>
                  <option value="inter">Inter</option>
                  <option value="open-sans">Open Sans</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading || !isDirty}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}