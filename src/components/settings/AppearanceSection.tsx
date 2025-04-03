// src/components/settings/AppearanceSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/buttonAdapter';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AppearanceSection() {
  const { settings, saveSettings, isLoading, error: settingsError } = useUserSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('inter');
  const [density, setDensity] = useState('comfortable');

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

  const handleDensityChange = (value: string) => {
    setDensity(value);
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
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Appearance Settings</h2>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert variant="success" className="mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-success" />
              <AlertDescription className="ml-3 text-success-foreground">{success}</AlertDescription>
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-destructive-foreground" />
              <AlertDescription className="ml-3">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-4">Font Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select 
                  value={fontSize} 
                  onValueChange={handleFontSizeChange}
                >
                  <SelectTrigger id="font-size" className="w-full">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Adjust the size of text throughout the application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select 
                  value={fontFamily} 
                  onValueChange={handleFontFamilyChange}
                >
                  <SelectTrigger id="font-family" className="w-full">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter (Default)</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the font style for the application
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Interface Density</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={cn(
                  "cursor-pointer p-4 rounded-lg border transition-all",
                  density === "comfortable" 
                    ? "border-primary bg-primary/10" 
                    : "border-input hover:border-primary/30"
                )}
                onClick={() => handleDensityChange("comfortable")}
              >
                <div className="font-medium text-center mb-2">Comfortable</div>
                <p className="text-xs text-center text-muted-foreground">
                  More space between elements
                </p>
              </div>

              <div 
                className={cn(
                  "cursor-pointer p-4 rounded-lg border transition-all",
                  density === "standard" 
                    ? "border-primary bg-primary/10" 
                    : "border-input hover:border-primary/30"
                )}
                onClick={() => handleDensityChange("standard")}
              >
                <div className="font-medium text-center mb-2">Standard</div>
                <p className="text-xs text-center text-muted-foreground">
                  Default spacing between elements
                </p>
              </div>

              <div 
                className={cn(
                  "cursor-pointer p-4 rounded-lg border transition-all",
                  density === "compact" 
                    ? "border-primary bg-primary/10" 
                    : "border-input hover:border-primary/30"
                )}
                onClick={() => handleDensityChange("compact")}
              >
                <div className="font-medium text-center mb-2">Compact</div>
                <p className="text-xs text-center text-muted-foreground">
                  Less space between elements
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Animation Settings</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="animations" 
                  defaultChecked
                  onCheckedChange={() => setIsDirty(true)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="animations">Enable animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn on/off interface animations and transitions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="reduceMotion" 
                  onCheckedChange={() => setIsDirty(true)}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor="reduceMotion">Reduce motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Use simpler animations for accessibility
                  </p>
                </div>
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