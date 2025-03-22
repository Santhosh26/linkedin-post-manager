// src/hooks/useLinkedInStatus.ts
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { shouldCheckLinkedInStatus, recordLinkedInStatusCheck, resetApiTracking } from '@/lib/utils/apiThrottle';

/**
 * Hook for checking LinkedIn connection status, with global
 * throttling to prevent excessive API calls.
 */
export function useLinkedInStatus() {
  const { data: session, status: sessionStatus, update } = useSession();
  const [status, setStatus] = useState<{connected: boolean}>({ 
    connected: !!session?.user?.linkedinConnected 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if this instance of the hook has already checked
  const hasCheckedInThisInstance = useRef(false);
  
  // Force a refresh of the API status
  const resetStatus = () => {
    hasCheckedInThisInstance.current = false;
    resetApiTracking('linkedin_status_last_check');
    setIsLoading(true);
  };
  
  // Initialize based on session data whenever session changes
  useEffect(() => {
    // If we have a definitive answer from the session, use it
    if (session?.user) {
      setStatus({ connected: !!session.user.linkedinConnected });
      if (session.user.linkedinConnected) {
        // If session already says we're connected, still verify but don't show loading
        setIsLoading(false);
      }
    }
  }, [session]);
  
  // Only make an API call if we need additional verification
  useEffect(() => {
    // Skip if we're still loading the session
    if (sessionStatus === 'loading') {
      return;
    }
    
    // Skip if we've already checked in this instance and we're connected
    if (hasCheckedInThisInstance.current && status.connected) {
      setIsLoading(false);
      return;
    }
    
    // Global check if we should make the API call
    const shouldCheck = shouldCheckLinkedInStatus();
    if (!shouldCheck && status.connected) {
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Record that we're making the call
        recordLinkedInStatusCheck();
        
        console.log('Checking LinkedIn connection status via API...');
        
        // Use AbortController to cancel the request if component unmounts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
        
        // Updated to use consolidated endpoint
        const response = await fetch('/api/linkedin', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to check LinkedIn status');
        }
        
        const data = await response.json();
        setStatus(data);
        hasCheckedInThisInstance.current = true;
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('LinkedIn status check aborted');
        } else {
          setError('Failed to check LinkedIn status');
          console.error('Error checking LinkedIn status:', err);
        }
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [session, sessionStatus, status.connected]);
  
  // Method to manually refresh the status if needed
  const refresh = () => {
    resetStatus();
    // Also update the session to get the latest user data
    update();
  };
  
  return {
    isConnected: status.connected,
    isLoading,
    error,
    refresh
  };
}