// src/components/settings/ResearchPreferencesSection.tsx
'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { CheckCircle, AlertCircle, Plus, X, ArrowUp, ArrowDown, Check, Slash } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/buttonAdapter';
import { Input } from '@/components/ui/input';
import { useUserSettings } from '@/lib/contexts/UserSettingsContext';
import { ResearchSource } from '@/lib/contexts/UserSettingsContext';

export default function ResearchPreferencesSection() {
  const { settings, updateSetting, saveSettings, isLoading, error } = useUserSettings();
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newExcludedDomain, setNewExcludedDomain] = useState('');
  
  useEffect(() => {
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleMaxResultsChange = (count: number) => {
    if (!settings || settings.defaultMaxResults === count) return;
    
    updateSetting('defaultMaxResults', count);
    setIsDirty(true);
  };

  const handleAddIncludedSource = () => {
    if (!settings || !newDomain.trim()) return;
    
    const domain = newDomain.trim();
    // Remove http/https and www from domain if present
    const cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    
    // Check if domain already exists
    if (settings.includedSources.some(source => source.domain === cleanDomain)) {
      return;
    }
    
    const newSource: ResearchSource = {
      domain: cleanDomain,
      priority: settings.includedSources.length + 1,
      enabled: true
    };
    
    updateSetting('includedSources', [...settings.includedSources, newSource]);
    setNewDomain('');
    setIsDirty(true);
  };

  const handleRemoveIncludedSource = (domain: string) => {
    if (!settings) return;
    
    const updatedSources = settings.includedSources.filter(source => source.domain !== domain);
    
    // Reorder priorities
    const reorderedSources = updatedSources.map((source, index) => ({
      ...source,
      priority: index + 1
    }));
    
    updateSetting('includedSources', reorderedSources);
    setIsDirty(true);
  };

  const handleToggleSourceEnabled = (domain: string) => {
    if (!settings) return;
    
    const updatedSources = settings.includedSources.map(source => 
      source.domain === domain 
        ? { ...source, enabled: !source.enabled }
        : source
    );
    
    updateSetting('includedSources', updatedSources);
    setIsDirty(true);
  };

  const handleMovePriority = (domain: string, direction: 'up' | 'down') => {
    if (!settings) return;
    
    const sources = [...settings.includedSources];
    const index = sources.findIndex(source => source.domain === domain);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      const temp = sources[index];
      sources[index] = sources[index - 1];
      sources[index - 1] = temp;
      
      // Update priorities
      sources[index].priority = index + 1;
      sources[index - 1].priority = index;
    } else if (direction === 'down' && index < sources.length - 1) {
      // Swap with next item
      const temp = sources[index];
      sources[index] = sources[index + 1];
      sources[index + 1] = temp;
      
      // Update priorities
      sources[index].priority = index + 1;
      sources[index + 1].priority = index + 2;
    } else {
      return; // No change needed
    }
    
    updateSetting('includedSources', sources);
    setIsDirty(true);
  };

  const handleAddExcludedDomain = () => {
    if (!settings || !newExcludedDomain.trim()) return;
    
    const domain = newExcludedDomain.trim();
    // Remove http/https and www from domain if present
    const cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    
    // Check if domain already exists
    if (settings.excludedDomains.includes(cleanDomain)) {
      return;
    }
    
    updateSetting('excludedDomains', [...settings.excludedDomains, cleanDomain]);
    setNewExcludedDomain('');
    setIsDirty(true);
  };

  const handleRemoveExcludedDomain = (domain: string) => {
    if (!settings) return;
    
    const updatedDomains = settings.excludedDomains.filter(d => d !== domain);
    updateSetting('excludedDomains', updatedDomains);
    setIsDirty(true);
  };

  const handleSave = async () => {
    await saveSettings();
    setSuccess('Research preferences saved successfully');
    setIsDirty(false);
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Settings</CardTitle>
        <CardDescription>Configure your content research preferences</CardDescription>
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

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-medium mb-4">Default Results Count</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Research Results: <span className="font-bold text-primary">{settings.defaultMaxResults}</span>
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-muted-foreground">5</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={settings.defaultMaxResults}
                  onChange={(e) => handleMaxResultsChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs text-muted-foreground">20</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Select the default number of research results to retrieve
              </p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Prioritized Sources</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  id="includedDomain"
                  placeholder="Enter domain to prioritize (e.g., linkedin.com)"
                  className="flex-1"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIncludedSource();
                    }
                  }}
                />
                <Button
                  onClick={handleAddIncludedSource}
                  disabled={!newDomain.trim()}
                >
                  <Plus className="h-5 w-5" />
                  Add
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Prioritized Sources</h4>
                {settings.includedSources.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No prioritized sources added</p>
                ) : (
                  <div className="space-y-2">
                    {settings.includedSources
                      .sort((a, b) => a.priority - b.priority)
                      .map((source) => (
                        <div
                          key={source.domain}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            source.enabled
                              ? 'border-success/30 bg-success/10'
                              : 'border bg-muted/70 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="font-medium">
                              {source.domain}
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Priority: {source.priority}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMovePriority(source.domain, 'up')}
                              disabled={source.priority === 1}
                              className={`p-1 rounded-full hover:bg-muted ${
                                source.priority === 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              aria-label="Move up priority"
                            >
                              <ArrowUp className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleMovePriority(source.domain, 'down')}
                              disabled={source.priority === settings.includedSources.length}
                              className={`p-1 rounded-full hover:bg-muted ${
                                source.priority === settings.includedSources.length
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                              aria-label="Move down priority"
                            >
                              <ArrowDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleToggleSourceEnabled(source.domain)}
                              className="p-1 rounded-full hover:bg-muted"
                              aria-label={source.enabled ? 'Disable source' : 'Enable source'}
                            >
                              {source.enabled ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Slash className="h-4 w-4 text-destructive" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveIncludedSource(source.domain)}
                              className="p-1 rounded-full hover:bg-muted hover:text-destructive"
                              aria-label="Remove source"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Excluded Domains</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  id="excludedDomain"
                  placeholder="Enter domain to exclude (e.g., pinterest.com)"
                  className="flex-1"
                  value={newExcludedDomain}
                  onChange={(e) => setNewExcludedDomain(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExcludedDomain();
                    }
                  }}
                />
                <Button
                  onClick={handleAddExcludedDomain}
                  disabled={!newExcludedDomain.trim()}
                >
                  <Plus className="h-5 w-5" />
                  Add
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Excluded Domains</h4>
                {settings.excludedDomains.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No excluded domains added</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.excludedDomains.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive"
                      >
                        {domain}
                        <button
                          type="button"
                          className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-destructive/70 hover:bg-destructive/20 hover:text-destructive focus:outline-none"
                          onClick={() => handleRemoveExcludedDomain(domain)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-base font-medium mb-4">Advanced Research Options</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center">
                  <input
                    id="recentResults"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border rounded"
                    defaultChecked
                  />
                  <label htmlFor="recentResults" className="ml-2 block text-sm">
                    Prioritize recent content
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
                  Prefer content published within the last month
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="includeNews"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border rounded"
                    defaultChecked
                  />
                  <label htmlFor="includeNews" className="ml-2 block text-sm">
                    Include news sources
                  </label>
                </div>
                <p className="mt-1 text-xs text-muted-foreground ml-6">
                  Include results from news websites and publications
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Search Depth
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border 
                            bg-card 
                            focus:outline-none focus:ring-primary
                            focus:border-primary
                            sm:text-sm rounded-md transition-colors"
                  defaultValue="advanced"
                >
                  <option value="basic">Basic - Faster but less thorough</option>
                  <option value="advanced">Advanced - More comprehensive results</option>
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