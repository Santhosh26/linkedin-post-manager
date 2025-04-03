// src/components/admin/CronTrigger.tsx
'use client';

import { useState } from 'react';
import { Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

export default function CronTrigger() {
  const { toast } = useToast();
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
      toast({
        title: "Cron Job Triggered",
        description: `Published ${data.results.successful} posts (${data.results.failed} failed, ${data.results.skipped} skipped)`,
      });
    } catch (err) {
      console.error('Error triggering cron job:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Cron Job Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border-warning bg-warning/10 mb-6">
      <CardHeader>
        <CardTitle>Developer Tools - Trigger Scheduled Posts (Remove for production)</CardTitle>
        <CardDescription>Run the scheduled post publishing job manually</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-card p-4 rounded-md mb-4 border">
          <p className="text-sm text-muted-foreground mb-4">
            This tool allows you to manually trigger the cron job that publishes scheduled posts.
            It&apos;s only available in development mode.
          </p>
          
          <div className="mb-4 space-y-2">
            <Label htmlFor="cron-secret">CRON_SECRET</Label>
            <Input
              id="cron-secret"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your CRON_SECRET value"
            />
            <p className="text-xs text-muted-foreground">
              This should match the CRON_SECRET in your environment variables
            </p>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-5 w-5" />
            <div className="ml-3 flex-1">
              <p className="font-medium">
                Cron job executed successfully
              </p>
              <div className="mt-2">
                <p>Results:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Total posts: {result.results.total}</li>
                  <li>Published: {result.results.successful}</li>
                  <li>Failed: {result.results.failed}</li>
                  <li>Skipped: {result.results.skipped}</li>
                </ul>
                <p className="mt-2">Full details:</p>
                <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={triggerCronJob} 
          disabled={isLoading || !secretKey}
          variant="outline"
        >
          <Play className="mr-2" />
          {isLoading ? 'Running...' : 'Trigger Cron Job Manually'}
        </Button>
      </CardFooter>
    </Card>
  );
}