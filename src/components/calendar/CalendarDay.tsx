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
          ? 'bg-muted text-muted-foreground'
          : isToday
          ? 'bg-accent border-primary'
          : 'bg-card'
      } transition-colors`}
    >
      <div className="font-medium text-sm text-foreground">
        {format(day, 'd')}
        {isToday && (
          <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
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
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-secondary text-secondary-foreground group-hover:bg-accent'
                  } text-xs p-1.5 rounded-md transition-all shadow-sm hover:shadow`}
                >
                  <div className="flex justify-between items-center">
                    <div className="truncate flex-1">
                      {format(new Date(post.scheduledFor), 'h:mm a')}
                    </div>
                    <button
                      onClick={(e) => toggleExpandPost(post.id, e)}
                      className="text-primary hover:text-primary-foreground p-1 rounded-full hover:bg-primary/10 transition-colors"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="mt-1 truncate">
                    {post.content.substring(0, 40)}
                    {post.content.length > 40 ? '...' : ''}
                  </div>
                  
                  {expandedPost === post.id && (
                    <div className="mt-2 flex justify-between border-t border-border pt-1">
                      <Link 
                        href={`/posts/${post.id}`}
                        className="flex items-center text-muted-foreground hover:text-foreground p-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span>View</span>
                      </Link>
                      
                      <button
                        onClick={(e) => handlePublishNow(post.id, e)}
                        disabled={publishingId === post.id}
                        className="flex items-center text-muted-foreground hover:text-foreground p-1 disabled:opacity-50 transition-colors"
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