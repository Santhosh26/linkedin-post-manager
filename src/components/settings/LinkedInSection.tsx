// src/components/settings/LinkedInSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { FiLinkedin, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface LinkedInConnectionStatus {
  connected: boolean;
}

export default function LinkedInSection() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<LinkedInConnectionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if the user has already connected their LinkedIn account
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/linkedin/post');
        
        if (!response.ok) {
          throw new Error('Failed to fetch LinkedIn connection status');
        }
        
        const data = await response.json();
        setConnectionStatus(data);
      } catch (err) {
        console.error('Error fetching LinkedIn connection status:', err);
        setError('Failed to check LinkedIn connection status');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConnectionStatus();
  }, []);

  // Handle connecting to LinkedIn
  const handleConnectLinkedIn = async () => {
    // Use direct signin with linkedin provider - this will redirect to LinkedIn's auth page
    await signIn('linkedin', { 
      callbackUrl: `${window.location.origin}/settings?tab=linkedin` 
    });
  };

  // Handle disconnecting from LinkedIn
  const handleDisconnectLinkedIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get accounts from the database and remove the LinkedIn provider
      const response = await fetch('/api/linkedin/disconnect', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect LinkedIn account');
      }
      
      // Update connection status
      setConnectionStatus({
        connected: false,
      });
      
      setSuccess('LinkedIn account disconnected successfully');
      
      // Update session to reflect the disconnection
      await update();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error disconnecting LinkedIn account:', err);
      setError('Failed to disconnect LinkedIn account');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine connection status from session if available
  const isConnected = session?.user?.linkedinConnected || 
                     (connectionStatus?.connected ?? false);

  return (
    <Card>
      <CardHeader title="LinkedIn Integration" subtitle="Connect your LinkedIn account to enable one-click posting" />
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
          <div className="bg-white dark:bg-dark-bg-tertiary rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiLinkedin className="h-10 w-10 text-[#0077B5]" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    LinkedIn Account
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                    {isLoading
                      ? 'Checking connection status...'
                      : isConnected
                      ? 'Your LinkedIn account is connected'
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
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">About LinkedIn Integration</h4>
            <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>Connect your LinkedIn account to post updates directly from this app</li>
              <li>Your credentials are securely stored and never shared</li>
              <li>You can disconnect at any time</li>
              <li>Uses OAuth 2.0 for secure authentication</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By connecting your LinkedIn account, you authorize this application to create posts on your behalf.
          This integration uses LinkedIn's official API and follows their terms of service.
        </p>
      </CardFooter>
    </Card>
  );
}