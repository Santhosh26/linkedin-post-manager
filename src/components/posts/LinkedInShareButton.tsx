//src\components\posts\LinkedInShareButton.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { useLinkedInStatus } from '@/hooks/useLinkedInStatus';
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
        <p className="text-sm text-muted-foreground mb-2">
          Connect your LinkedIn account in settings to share posts directly.
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={true}
        >
          {/* LinkedIn icon SVG */}
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
        <div className="mb-2 bg-destructive/10 border-l-4 border-destructive p-3 rounded text-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="ml-3">
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-2">
        {showOptions && (
          <div className="bg-muted p-3 rounded-md mb-2">
            <Label className="block text-sm font-medium mb-2">
              Visibility
            </Label>
            <RadioGroup 
              value={visibility} 
              onValueChange={(value) => setVisibility(value as 'PUBLIC' | 'CONNECTIONS')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PUBLIC" id="public" />
                <Label htmlFor="public" className="text-sm">Public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONNECTIONS" id="connections" />
                <Label htmlFor="connections" className="text-sm">Connections only</Label>
              </div>
            </RadioGroup>
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
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
                Sharing to LinkedIn...
              </span>
            ) : (
              <>
                {/* LinkedIn icon SVG */}
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