// src/components/calendar/CalendarDay.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Send, Eye, MoreVertical } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor: string;
}

interface CalendarDayProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: Post[];
  onPublishNow: (postId: string) => Promise<void>;
}

export default function CalendarDay({ day, isCurrentMonth, isToday, posts, onPublishNow }: CalendarDayProps) {
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
      className={`min-h-[120px] p-2 ${
        !isCurrentMonth
          ? 'bg-gray-100 text-gray-400'
          : isToday
          ? 'bg-primary-50 border-primary-200'
          : 'bg-white'
      } transition-colors`}
    >
      <div className="font-medium text-sm text-gray-900">
        {format(day, 'd')}
        {isToday && (
          <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
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
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-primary-50 text-primary-700 group-hover:bg-primary-100'
                  } text-xs p-1.5 rounded-md transition-all shadow-sm hover:shadow`}
                >
                  <div className="flex justify-between items-center">
                    <div className="truncate flex-1">
                      {format(new Date(post.scheduledFor), 'h:mm a')}
                    </div>
                    <button
                      onClick={(e) => toggleExpandPost(post.id, e)}
                      className="text-primary-600 hover:text-primary-800 p-1 rounded-full hover:bg-primary-200 transition-colors"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="mt-1 truncate">
                    {post.content.substring(0, 40)}
                    {post.content.length > 40 ? '...' : ''}
                  </div>
                  
                  {expandedPost === post.id && (
                    <div className="mt-2 flex justify-between border-t border-primary-200 pt-1">
                      <Link 
                        href={`/posts/${post.id}`}
                        className="flex items-center text-primary-600 hover:text-primary-800 p-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View</span>
                      </Link>
                      
                      <button
                        onClick={(e) => handlePublishNow(post.id, e)}
                        disabled={publishingId === post.id}
                        className="flex items-center text-primary-600 hover:text-primary-800 p-1 disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-3 w-3 mr-1" />
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