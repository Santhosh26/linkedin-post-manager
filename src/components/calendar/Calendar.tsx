// src/components/calendar/Calendar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import CalendarDay from './CalendarDay';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor: string;
}

interface CalendarProps {
  posts: Post[];
  onRefresh?: () => void;
}

const Calendar = ({ posts, onRefresh }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [publishingStatus, setPublishingStatus] = useState<{
    isPublishing: boolean;
    success: boolean;
    error: string | null;
    lastPublishedId: string | null;
  }>({
    isPublishing: false,
    success: false,
    error: null,
    lastPublishedId: null
  });
  
  // Get days for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Group posts by date
  const postsByDate: Record<string, Post[]> = {};
  
  posts.forEach(post => {
    if (post.status === 'SCHEDULED' && post.scheduledFor) {
      const date = post.scheduledFor.split('T')[0]; // Get YYYY-MM-DD part
      if (!postsByDate[date]) {
        postsByDate[date] = [];
      }
      postsByDate[date].push(post);
    }
  });
  
  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Handle immediate publishing from calendar
  const handlePublishPost = async (postId: string) => {
    setPublishingStatus({
      isPublishing: true,
      success: false,
      error: null,
      lastPublishedId: postId
    });
    
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to publish post');
      }
      
      // Update status
      setPublishingStatus({
        isPublishing: false,
        success: true,
        error: null,
        lastPublishedId: postId
      });
      
      // Clear the success status after 3 seconds
      setTimeout(() => {
        setPublishingStatus(prev => ({
          ...prev,
          success: false,
          lastPublishedId: null
        }));
      }, 3000);
      
      // Optional refresh callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      setPublishingStatus({
        isPublishing: false,
        success: false,
        error: err instanceof Error ? err.message : 'Failed to publish post',
        lastPublishedId: postId
      });
      
      // Clear the error status after 5 seconds
      setTimeout(() => {
        setPublishingStatus(prev => ({
          ...prev,
          error: null,
          lastPublishedId: null
        }));
      }, 5000);
    }
  };
  
  // Days of week header
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card>
      <CardHeader
        title="Content Calendar"
        action={
          <Link href="/posts/new">
            <Button>
              <FiCalendar className="mr-2" />
              Schedule Post
            </Button>
          </Link>
        }
      />
      <CardContent>
        {publishingStatus.success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-3 rounded-md">
            <div className="flex">
              <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-400">Post published successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        {publishingStatus.error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-3 rounded-md">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{publishingStatus.error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <FiChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <FiChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px">
          {/* Days of week header */}
          {daysOfWeek.map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const postsForDay = postsByDate[formattedDate] || [];
            
            return (
              <CalendarDay
                key={day.toString()}
                day={day}
                monthStart={monthStart}
                posts={postsForDay}
                onPublishNow={handlePublishPost}
              />
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Click on a post to view or edit it. Expand a post to see quick actions.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;