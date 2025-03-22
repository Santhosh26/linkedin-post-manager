// src/components/admin/CronTrigger.tsx
'use client';

import { useState } from 'react';
import { FiPlay, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

export default function CronTrigger() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [secretKey, setSecretKey] = useState('');
  
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const triggerCronJob = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/cron/publish-scheduled-posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to trigger cron job');
      }
      
      setResult(data);
    } catch (err) {
      console.error('Error triggering cron job:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/20 mb-6">
      <CardHeader title="Developer Tools - Trigger Scheduled Posts" subtitle="Run the scheduled post publishing job manually" />
      <CardContent>
        <div className="bg-white dark:bg-dark-bg-tertiary p-4 rounded-md mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This tool allows you to manually trigger the cron job that publishes scheduled posts.
            It's only available in development mode.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              CRON_SECRET
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-dark-bg-tertiary"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your CRON_SECRET value"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This should match the CRON_SECRET in your environment variables
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {result && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Cron job executed successfully
                </p>
                <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                  <p>Results:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Total posts: {result.results.total}</li>
                    <li>Published: {result.results.successful}</li>
                    <li>Failed: {result.results.failed}</li>
                    <li>Skipped: {result.results.skipped}</li>
                  </ul>
                  <p className="mt-2">Full details:</p>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-800 rounded overflow-auto text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={triggerCronJob} 
          disabled={isLoading || !secretKey}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <FiPlay className="mr-2" />
          {isLoading ? 'Running...' : 'Trigger Cron Job Manually'}
        </Button>
      </CardFooter>
    </Card>
  );
}