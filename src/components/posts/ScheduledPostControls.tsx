'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenSquare, Send, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/buttonAdapter';
import { useToast } from "@/hooks/use-toast";

interface ScheduledPostControlsProps {
  postId: string;
  scheduledTime: string;
  onSuccess?: () => void;
}

export default function ScheduledPostControls({
  postId,
  scheduledTime,
  onSuccess
}: ScheduledPostControlsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePublishNow = async () => {
    if (!window.confirm('Are you sure you want to publish this post now?')) {
      return;
    }
    
    setIsPublishing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to publish post');
      }
      
      toast({
        title: "Post Published",
        description: "Your post has been published successfully.",
      });
      
      // Show success and refresh/redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish post. Please try again.';

      toast({
        title: "Publishing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-4">
      {error && (
        <div className="mb-4 bg-destructive/10 border-l-4 border-destructive p-3 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-sm font-medium text-primary flex items-center">
            <Calendar className="mr-2" /> Scheduled Post
          </h3>
          <p className="text-xs text-primary/70 mt-1">
            Scheduled for: {new Date(scheduledTime).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <Link href={`/posts/${postId}`}>
            <Button size="sm" variant="secondary">
              <PenSquare className="mr-1 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="default"
            onClick={handlePublishNow}
            disabled={isPublishing}
          >
            <Send className="mr-1 h-4 w-4" /> 
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}