// src/components/calendar/CalendarDay.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, isToday, isSameMonth } from 'date-fns';
import { FiSend, FiEye, FiMoreVertical } from 'react-icons/fi';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor: string;
}

interface CalendarDayProps {
  day: Date;
  monthStart: Date;
  posts: Post[];
  onPublishNow: (postId: string) => Promise<void>;
}

export default function CalendarDay({ day, monthStart, posts, onPublishNow }: CalendarDayProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublishNow = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent parent handlers
    
    try {
      setPublishingId(postId);
      await onPublishNow(postId);
    } finally {
      setPublishingId(null);
    }
  };

  const toggleExpandPost = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <div
      className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 ${
        !isSameMonth(day, monthStart)
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          : isToday(day)
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          : ''
      }`}
    >
      <div className="font-medium text-sm text-gray-900 dark:text-dark-text-primary">
        {format(day, 'd')}
        {isToday(day) && (
          <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
            •
          </span>
        )}
      </div>
      
      {posts.length > 0 && (
        <div className="mt-1 space-y-1">
          {posts.map(post => (
            <div key={post.id} className="relative group">
              <Link 
                href={`/posts/${post.id}`}
                className="block"
              >
                <div className={`${
                  expandedPost === post.id 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  } text-blue-800 dark:text-blue-300 text-xs p-1 rounded transition-colors`}
                >
                  <div className="flex justify-between items-center">
                    <div className="truncate flex-1">
                      {format(new Date(post.scheduledFor), 'h:mm a')}
                    </div>
                    <button
                      onClick={(e) => toggleExpandPost(post.id, e)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <FiMoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="mt-1 truncate">
                    {post.content.substring(0, 40)}
                    {post.content.length > 40 ? '...' : ''}
                  </div>
                  
                  {expandedPost === post.id && (
                    <div className="mt-2 flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1">
                      <Link 
                        href={`/posts/${post.id}`}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiEye className="h-3 w-3 mr-1" />
                        <span>View</span>
                      </Link>
                      
                      <button
                        onClick={(e) => handlePublishNow(post.id, e)}
                        disabled={publishingId === post.id}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 disabled:opacity-50"
                      >
                        <FiSend className="h-3 w-3 mr-1" />
                        <span>{publishingId === post.id ? 'Publishing...' : 'Publish'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}