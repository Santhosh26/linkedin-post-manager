// src/components/settings/ContentPreferencesSection.tsx
// src/components/settings/ContentPreferencesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/buttonAdapter';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';
import { PostTone } from '@/lib/contexts/UserSettingsContext';
import { useToast } from "@/hooks/use-toast";

export default function ContentPreferencesSection() {
  const { toast } = useToast();
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
    try {
      await saveSettings();
      
      toast({
        title: "Preferences Saved",
        description: "Your content preferences have been saved successfully.",
      });
      setIsDirty(false);
    } catch (err) {
      const errorMessage = `Failed to save preferences: ${err instanceof Error ? err.message : 'Unknown error'}`;
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Content Preferences</h2>
        <p className="text-sm text-muted-foreground">Default settings for content generation</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="ml-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success/10 border-l-4 border-success p-4 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-success" />
              <div className="ml-3">
                <p className="text-sm text-success">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-4">Default Content Tone</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'professional'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => handleToneChange('professional')}
              >
                <div className="font-medium text-center mb-2">Professional</div>
                <p className="text-xs text-center text-muted-foreground">
                  Formal, authoritative tone for business audience
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'casual'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => handleToneChange('casual')}
              >
                <div className="font-medium text-center mb-2">Casual</div>
                <p className="text-xs text-center text-muted-foreground">
                  Conversational, friendly tone for general audience
                </p>
              </div>

              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                  settings.defaultPostTone === 'thoughtful'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => handleToneChange('thoughtful')}
              >
                <div className="font-medium text-center mb-2">Thoughtful</div>
                <p className="text-xs text-center text-muted-foreground">
                  Reflective, insightful tone for deeper engagement
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Default Number of Variations</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Post Variations: <span className="font-bold text-primary">{settings.defaultVariationCount}</span>
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-muted-foreground">1</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.defaultVariationCount}
                  onChange={(e) => handleVariationCountChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs text-muted-foreground">5</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Select how many post variations to generate by default
              </p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Content Format Options</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center">
                  <input
                    id="hashtags"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border rounded"
                    defaultChecked
                  />
                  <label htmlFor="hashtags" className="ml-2 block text-sm">
                    Auto-generate hashtags
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
                  Automatically suggest relevant hashtags with generated content
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="emojis"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border rounded"
                    defaultChecked
                  />
                  <label htmlFor="emojis" className="ml-2 block text-sm">
                    Include emojis
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
                  Add emojis to make posts more engaging and visual
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="callToAction"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border rounded"
                    defaultChecked
                  />
                  <label htmlFor="callToAction" className="ml-2 block text-sm">
                    Add call-to-action
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
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