// src/components/posts/LinkedInShareButton.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiLinkedin, FiAlertCircle, FiEye } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { useLinkedInStatus } from '@/hooks/useLinkedInStatus';

interface LinkedInShareButtonProps {
  postId: string;
  onSuccess?: (linkedinUrl: string) => void;
}

export default function LinkedInShareButton({ postId, onSuccess }: LinkedInShareButtonProps) {
  const { data: session } = useSession();
  const { isConnected } = useLinkedInStatus();
  
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS'>('PUBLIC');
  const [showOptions, setShowOptions] = useState(false);
  
  const handleShareToLinkedIn = async () => {
    try {
      setIsSharing(true);
      setError(null);
      
      // Updated to use consolidated endpoint with the Post-specific publish method
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST', // Using POST for publish action
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility,
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
      
      // Reset the options panel
      setShowOptions(false);
    } catch (err) {
      console.error('Error sharing to LinkedIn:', err);
      setError(err instanceof Error ? err.message : 'Failed to share to LinkedIn');
    } finally {
      setIsSharing(false);
    }
  };
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  if (!isConnected) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Connect your LinkedIn account in settings to share posts directly.
        </p>
        <Button
          variant="outline"
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
      
      <div className="flex flex-col space-y-2">
        {showOptions && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  checked={visibility === 'PUBLIC'}
                  onChange={() => setVisibility('PUBLIC')}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  checked={visibility === 'CONNECTIONS'}
                  onChange={() => setVisibility('CONNECTIONS')}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Connections only</span>
              </label>
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={handleShareToLinkedIn}
            disabled={isSharing}
            className="flex-1"
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
          
          <Button
            variant="outline"
            onClick={toggleOptions}
            title="Sharing options"
          >
            <FiEye className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}