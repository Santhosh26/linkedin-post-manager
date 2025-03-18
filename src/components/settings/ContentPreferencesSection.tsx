// src/components/settings/ContentPreferencesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';
import { PostTone } from '@/lib/contexts/UserSettingsContext';

export default function ContentPreferencesSection() {
  const { settings, updateSetting, saveSettings, isLoading, error } = useUserSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleToneChange = (tone: PostTone) => {
    if (!settings || settings.defaultPostTone === tone) return;
    
    updateSetting('defaultPostTone', tone);
    setIsDirty(true);
  };

  const handleVariationCountChange = (count: number) => {
    if (!settings || settings.defaultVariationCount === count) return;
    
    updateSetting('defaultVariationCount', count);
    setIsDirty(true);
  };

  const handleSave = async () => {
    await saveSettings();
    setSuccess('Content preferences saved successfully');
    setIsDirty(false);
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader title="Content Preferences" subtitle="Default settings for content generation" />
      <CardContent>
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

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
            <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary mb-4">Default Content Tone</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'professional'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleToneChange('professional')}
              >
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">Professional</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Formal, authoritative tone for business audience
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'casual'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleToneChange('casual')}
              >
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">Casual</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Conversational, friendly tone for general audience
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'thoughtful'
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => handleToneChange('thoughtful')}
              >
                <div className="font-medium text-center text-gray-900 dark:text-dark-text-primary mb-2">Thoughtful</div>
                <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                  Reflective, insightful tone for deeper engagement
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary mb-4">Default Number of Variations</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Number of Post Variations: <span className="font-bold text-primary-600 dark:text-primary-400">{settings.defaultVariationCount}</span>
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">1</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.defaultVariationCount}
                  onChange={(e) => handleVariationCountChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">5</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
                Select how many post variations to generate by default
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary mb-4">Content Format Options</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center">
                  <input
                    id="hashtags"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-gray-700"
                    defaultChecked
                  />
                  <label htmlFor="hashtags" className="ml-2 block text-sm text-gray-900 dark:text-dark-text-primary">
                    Auto-generate hashtags
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary ml-6">
                  Automatically suggest relevant hashtags with generated content
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="emojis"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-gray-700"
                    defaultChecked
                  />
                  <label htmlFor="emojis" className="ml-2 block text-sm text-gray-900 dark:text-dark-text-primary">
                    Include emojis
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary ml-6">
                  Add emojis to make posts more engaging and visual
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="callToAction"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-dark-bg-tertiary dark:border-gray-700"
                    defaultChecked
                  />
                  <label htmlFor="callToAction" className="ml-2 block text-sm text-gray-900 dark:text-dark-text-primary">
                    Add call-to-action
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary ml-6">
                  Include prompts to encourage engagement (like, comment, share)
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