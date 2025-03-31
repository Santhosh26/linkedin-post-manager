'use client';

import { useState } from 'react';
import { AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { useLinkedInStatus } from '@/hooks/useLinkedInStatus';
import { useToast } from "@/hooks/use-toast";

interface LinkedInShareButtonProps {
  postId: string;
  onSuccess?: (linkedinUrl: string) => void;
}

export default function LinkedInShareButton({ postId, onSuccess }: LinkedInShareButtonProps) {
  const { toast } = useToast();
  const { isConnected } = useLinkedInStatus();
  
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS'>('PUBLIC');
  const [showOptions, setShowOptions] = useState(false);
  
  const handleShareToLinkedIn = async () => {
    try {
      setIsSharing(true);
      setError(null);
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST',
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
      
      toast({
        title: "Shared to LinkedIn",
        description: "Your post has been shared to LinkedIn successfully.",
      });
      
      // If the share was successful and we have a URL, call the onSuccess callback
      if (data.linkedinPostUrl && onSuccess) {
        onSuccess(data.linkedinPostUrl);
      }
      
      // Reset the options panel
      setShowOptions(false);
    } catch (err) {
      console.error('Error sharing to LinkedIn:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to share to LinkedIn';
      
      toast({
        title: "Share Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
          variant="secondary"
          size="sm"
          disabled={true}
        >
          {/* Replace deprecated Linkedin icon with custom SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
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
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
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
            variant="default"
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
                {/* Replace deprecated Linkedin icon with custom SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                Share to LinkedIn
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            onClick={toggleOptions}
            title="Sharing options"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}