// src/components/posts/ScheduledPostControls.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiSend, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';

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
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to publish post');
      }
      
      // Show success and refresh/redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-3 rounded-md">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
            <FiCalendar className="mr-2" /> Scheduled Post
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Scheduled for: {new Date(scheduledTime).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <Link href={`/posts/${postId}`}>
            <Button size="sm" variant="outline">
              <FiEdit2 className="mr-1 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button 
            size="sm" 
            variant="primary"
            onClick={handlePublishNow}
            disabled={isPublishing}
          >
            <FiSend className="mr-1 h-4 w-4" /> 
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}