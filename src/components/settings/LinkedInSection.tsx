//src\components\settings\LinkedInSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AlertCircle, CheckCircle, Unplug, RefreshCw, Shield, ExternalLink } from 'lucide-react';

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/buttonAdapter';
import { useLinkedInStatus } from '@/hooks/useLinkedInStatus';
import { resetApiTracking } from '@/lib/utils/apiThrottle';
import { useToast } from "@/hooks/use-toast";

export default function LinkedInSection() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Use the custom hook for LinkedIn status
  const { isConnected, isLoading, refresh } = useLinkedInStatus();
  
  // Process URL parameters once
  const hasProcessedParams = useRef(false);
  
  // Keep track of connection operations to prevent loops
  const isConnecting = useRef(false);

  // Critical fix: Check for success parameter and remove it from URL to prevent loops
  useEffect(() => {
    if (searchParams.has('success') && searchParams.get('success') === 'true') {
      // Remove the success parameter from URL to prevent triggering again
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      // Use history.replaceState to update URL without triggering a page reload
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  // Check URL parameters for errors or success messages
  useEffect(() => {
    // Skip if already processed these params
    if (hasProcessedParams.current) return;
    
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    
    if (errorParam) {
      let errorMessage = 'Failed to connect to LinkedIn.';
      
      // Map error codes to user-friendly messages
      if (errorParam === 'linkedin_unauthorized_scope_error') {
        errorMessage = 'LinkedIn authorization failed: Your app needs proper permissions. Please check LinkedIn Developer Portal.';
      } else if (errorParam === 'linkedin_auth') {
        errorMessage = 'Could not authenticate with LinkedIn. Please try again.';
      } else if (errorParam === 'callback_failed') {
        errorMessage = 'There was a problem connecting to LinkedIn. Please try again.';
      } else if (errorParam === 'linkedin_config') {
        errorMessage = 'LinkedIn client ID not configured. Please check your environment variables.';
      }
      
      setError(errorMessage);
    }
    
    if (successParam === 'true') {
      setSuccess('LinkedIn account connected successfully!');
      
      // Reset API tracking to force a fresh check
      resetApiTracking('linkedin_status_last_check');
      
      // Update session to reflect the new connection status
      update();
      
      // Refresh LinkedIn status
      refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
    
    hasProcessedParams.current = true;
  }, [searchParams, update, refresh]);

  // Handle connecting to LinkedIn - direct approach
  const handleConnectLinkedIn = () => {
    try {
      // Prevent multiple connection attempts
      if (isConnecting.current) return;
      isConnecting.current = true;
      
      setDebugInfo(null);
      console.log("Attempting to connect to LinkedIn...");
      
      // Create the callback URL - make sure it's URL encoded properly
      const callbackUrl = encodeURIComponent(`${window.location.origin}/settings?tab=linkedin`);
      
      // Use window.location to directly navigate to the auth endpoint
      window.location.href = `/api/auth/signin/linkedin?callbackUrl=${callbackUrl}`;
    } catch (err: unknown) {
      isConnecting.current = false;
      console.error("Error during LinkedIn connection:", err);
      setError("Failed to connect to LinkedIn. Please try again.");
    }
  };

  // Handle disconnecting from LinkedIn
  const handleDisconnectLinkedIn = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/linkedin', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect LinkedIn account');
      }
      
      
      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected successfully.",
      });
      
      // Reset API tracking to force a fresh check after disconnection
      resetApiTracking('linkedin_status_last_check');
      
      // Update session to reflect the disconnection
      await update();
      
      // Refresh LinkedIn status
      refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error disconnecting LinkedIn account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect LinkedIn account';
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Custom LinkedIn SVG icon to replace the deprecated Linkedin component
  const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">LinkedIn Integration</h2>
        <p className="text-sm text-muted-foreground">Connect your LinkedIn account to enable one-click posting</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-destructive">{error}</p>
                {error?.includes('permissions') && (
                  <div className="mt-2">
                    <a 
                      href="https://www.linkedin.com/developers/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-destructive hover:text-destructive/80 font-medium"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Check LinkedIn Developer Portal settings
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success/10 border-l-4 border-success p-4 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-success">{success}</p>
              </div>
            </div>
          </div>
        )}

        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-primary/10 border-l-4 border-primary p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-primary">{debugInfo}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LinkedInIcon className="h-10 w-10 text-[#0077B5]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium flex items-center">
                    LinkedIn Account
                    {isConnected && !isLoading && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? 'Checking connection status...'
                      : isConnected
                      ? 'Your LinkedIn account is connected and ready to post'
                      : 'Connect your LinkedIn account to share posts directly'}
                  </p>
                </div>
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                ) : isConnected ? (
                  <Button
                    variant="destructive"
                    size="default"
                    onClick={handleDisconnectLinkedIn}
                  >
                    <Unplug className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConnectLinkedIn}
                  >
                    <LinkedInIcon className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                )}
              </div>
            </div>
            
            {isConnected && (
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-success/10 rounded-md p-3">
                    <div className="flex items-center">
                      <RefreshCw className="h-5 w-5 text-success" />
                      <span className="ml-2 text-sm font-medium text-success">
                        Connection Status
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-success">
                      Connected and ready to post
                    </p>
                  </div>
                  
                  <div className="bg-success/10 rounded-md p-3">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-success" />
                      <span className="ml-2 text-sm font-medium text-success">
                        Permissions
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-success">
                      Post to LinkedIn on your behalf
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!isConnected && !isLoading && (
              <div className="mt-4 border-t pt-4">
                <div className="p-3 bg-primary/10 rounded-md">
                  <p className="text-sm text-primary flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Not connected to LinkedIn. Click the &quot;Connect LinkedIn&quot; button above to authorize this app.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-primary mb-2">About LinkedIn Integration</h4>
            <ul className="list-disc pl-5 text-sm text-primary space-y-1">
              <li>Connect your LinkedIn account to post updates directly from this app</li>
              <li>Your credentials are securely stored and never shared</li>
              <li>You can disconnect at any time</li>
              <li>Uses OAuth 2.0 for secure authentication</li>
              <li>Choose between public posts or connections-only visibility</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          <p>
            By connecting your LinkedIn account, you authorize this application to create posts on your behalf.
            This integration uses LinkedIn&apos;s official API and follows their terms of service.
          </p>
          {isConnected && (
            <p className="mt-2">
              <a 
                href="https://www.linkedin.com/psettings/permitted-services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Manage all connected applications on LinkedIn
              </a>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}