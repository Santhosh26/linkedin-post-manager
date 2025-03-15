// src/components/posts/LinkedInShareButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiLinkedin, FiAlertCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface LinkedInShareButtonProps {
  postId: string;
  onSuccess?: (linkedinUrl: string) => void;
}

export default function LinkedInShareButton({ postId, onSuccess }: LinkedInShareButtonProps) {
  const { data: session } = useSession();
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the user has connected their LinkedIn account
  const isLinkedInConnected = session?.user?.linkedinConnected;
  
  const handleShareToLinkedIn = async () => {
    try {
      setIsSharing(true);
      setError(null);
      
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          visibility: 'PUBLIC', // Default to public visibility
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to share to LinkedIn');
      }
      
      // If the share was successful and we have a URL, call the onSuccess callback
      if (data.linkedinPostUrl && onSuccess) {
        onSuccess(data.linkedinPostUrl);
      }
    } catch (err) {
      console.error('Error sharing to LinkedIn:', err);
      setError(err instanceof Error ? err.message : 'Failed to share to LinkedIn');
    } finally {
      setIsSharing(false);
    }
  };
  
  if (!isLinkedInConnected) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Connect your LinkedIn account in settings to share posts directly.
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={true}
        >
          <FiLinkedin className="mr-2 h-4 w-4" />
          LinkedIn not connected
        </Button>
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      {error && (
        <div className="mb-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-3 rounded text-sm">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <Button
        variant="primary"
        onClick={handleShareToLinkedIn}
        disabled={isSharing}
      >
        {isSharing ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
            Sharing to LinkedIn...
          </span>
        ) : (
          <>
            <FiLinkedin className="mr-2 h-5 w-5" />
            Share to LinkedIn
          </>
        )}
      </Button>
    </div>
  );
}