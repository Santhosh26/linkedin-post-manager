// src/components/settings/AppearanceSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';

export default function AppearanceSection() {
  const { settings, saveSettings, isLoading, error: settingsError } = useUserSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('inter');

  useEffect(() => {
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    // Set error from settings if any
    if (settingsError) {
      setError(settingsError);
    }
  }, [settingsError]);

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    setIsDirty(true);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      // In a real implementation, you would save fontSize and fontFamily to the user settings
      await saveSettings();
      setSuccess('Appearance settings saved successfully');
      setIsDirty(false);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    }
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader title="Appearance Settings" />
      <CardContent>
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Font Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="mt-1">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                              bg-white text-gray-900 rounded-md shadow-sm 
                              focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 
                              sm:text-sm transition-colors"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Adjust the size of text throughout the application
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <div className="mt-1">
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                              bg-white text-gray-900 rounded-md shadow-sm 
                              focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 
                              sm:text-sm transition-colors"
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                  >
                    <option value="inter">Inter (Default)</option>
                    <option value="roboto">Roboto</option>
                    <option value="open-sans">Open Sans</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Choose the font style for the application
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Interface Density</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="cursor-pointer p-4 rounded-lg border border-primary-500 bg-primary-50 shadow-sm transition-all"
                onClick={() => setIsDirty(true)}
              >
                <div className="font-medium text-center text-gray-900 mb-2">Comfortable</div>
                <p className="text-xs text-center text-gray-500">
                  More space between elements
                </p>
              </div>

              <div 
                className="cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
                onClick={() => setIsDirty(true)}
              >
                <div className="font-medium text-center text-gray-900 mb-2">Standard</div>
                <p className="text-xs text-center text-gray-500">
                  Default spacing between elements
                </p>
              </div>

              <div 
                className="cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
                onClick={() => setIsDirty(true)}
              >
                <div className="font-medium text-center text-gray-900 mb-2">Compact</div>
                <p className="text-xs text-center text-gray-500">
                  Less space between elements
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Animation Settings</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center">
                  <input
                    id="animations"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                    onChange={() => setIsDirty(true)}
                  />
                  <label htmlFor="animations" className="ml-2 block text-sm text-gray-900">
                    Enable animations
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Turn on/off interface animations and transitions
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="reduceMotion"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    onChange={() => setIsDirty(true)}
                  />
                  <label htmlFor="reduceMotion" className="ml-2 block text-sm text-gray-900">
                    Reduce motion
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  Use simpler animations for accessibility
                </p>
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