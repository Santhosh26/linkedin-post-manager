// src/components/settings/LinkedInSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiLinkedin, FiAlertCircle, FiCheckCircle, FiX, FiRefreshCw, FiShield, FiExternalLink } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLinkedInStatus } from '@/hooks/useLinkedInStatus';
import { resetApiTracking } from '@/lib/utils/apiThrottle';

export default function LinkedInSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
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
    } catch (err) {
      isConnecting.current = false;
      console.error("Error during LinkedIn connection:", err);
      setError("Failed to connect to LinkedIn. Please try again.");
    }
  };

  // Handle disconnecting from LinkedIn
  const handleDisconnectLinkedIn = async () => {
    try {
      setError(null);
      
      // Updated to use consolidated endpoint
      const response = await fetch('/api/linkedin', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect LinkedIn account');
      }
      
      setSuccess('LinkedIn account disconnected successfully');
      
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
    } catch (err) {
      console.error('Error disconnecting LinkedIn account:', err);
      setError('Failed to disconnect LinkedIn account');
    }
  };

  return (
    <Card>
      <CardHeader title="LinkedIn Integration" subtitle="Connect your LinkedIn account to enable one-click posting" />
      <CardContent>
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                {error?.includes('permissions') && (
                  <div className="mt-2">
                    <a 
                      href="https://www.linkedin.com/developers/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                      <FiExternalLink className="mr-1 h-3 w-3" />
                      Check LinkedIn Developer Portal settings
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}

        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">{debugInfo}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-bg-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiLinkedin className="h-10 w-10 text-[#0077B5]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary flex items-center">
                    LinkedIn Account
                    {isConnected && !isLoading && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <FiCheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
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
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
                ) : isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectLinkedIn}
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnectLinkedIn}
                  >
                    <FiLinkedin className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                )}
              </div>
            </div>
            
            {isConnected && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-md p-3">
                    <div className="flex items-center">
                      <FiRefreshCw className="h-5 w-5 text-green-500 dark:text-green-400" />
                      <span className="ml-2 text-sm font-medium text-green-700 dark:text-green-300">
                        Connection Status
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      Connected and ready to post
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-md p-3">
                    <div className="flex items-center">
                      <FiShield className="h-5 w-5 text-green-500 dark:text-green-400" />
                      <span className="ml-2 text-sm font-medium text-green-700 dark:text-green-300">
                        Permissions
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      Post to LinkedIn on your behalf
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!isConnected && !isLoading && (
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                  <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                    <FiAlertCircle className="mr-2 h-4 w-4" />
                    Not connected to LinkedIn. Click the "Connect LinkedIn" button above to authorize this app.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">About LinkedIn Integration</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-400 space-y-1">
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
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            By connecting your LinkedIn account, you authorize this application to create posts on your behalf.
            This integration uses LinkedIn's official API and follows their terms of service.
          </p>
          {isConnected && (
            <p className="mt-2">
              <a 
                href="https://www.linkedin.com/psettings/permitted-services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
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