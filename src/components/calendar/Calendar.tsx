// src/components/calendar/Calendar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CalendarDay from './CalendarDay';
import { useToast } from "@/hooks/use-toast";

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

const ContentCalendar = ({ posts, onRefresh }: CalendarProps) => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Updated state definition to remove success/error properties
  const [, setPublishingStatus] = useState<{
    isPublishing: boolean;
    lastPublishedId: string | null;
  }>({
    isPublishing: false,
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

  // Handle immediate publishing from calendar - simplified without success/error in state
  const handlePublishPost = async (postId: string) => {
    setPublishingStatus({
      isPublishing: true,
      lastPublishedId: postId
    });
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to publish post');
      }
      
      // Update status
      setPublishingStatus({
        isPublishing: false,
        lastPublishedId: postId
      });
      
      toast({
        title: "Post Published",
        description: "Your post has been published successfully.",
      });
      
      // Clear the lastPublishedId after 3 seconds
      setTimeout(() => {
        setPublishingStatus(prev => ({
          ...prev,
          lastPublishedId: null
        }));
      }, 3000);
      
      // Optional refresh callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish post';
      
      setPublishingStatus({
        isPublishing: false,
        lastPublishedId: null
      });
      
      toast({
        title: "Publishing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  // Days of week header
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Content Calendar</CardTitle>
        <Link href="/posts/new">
          <Button>
            <CalendarIcon className="mr-2" />
            Schedule Post
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden shadow border">
          {/* Days of week header */}
          {daysOfWeek.map(day => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm bg-muted">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const postsForDay = postsByDate[formattedDate] || [];
            
            // Add visual styles for today and non-current month days
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            
            return (
              <CalendarDay
                key={day.toString()}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isToday={isTodayDate}
                posts={postsForDay}
                onPublishNow={handlePublishPost}
              />
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Click on a post to view or edit it. Expand a post to see quick actions.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCalendar;