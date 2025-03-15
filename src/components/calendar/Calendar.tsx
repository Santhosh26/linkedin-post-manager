// src/components/calendar/Calendar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor: string;
}

interface CalendarProps {
  posts: Post[];
}

const Calendar = ({ posts }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
  
  // Day cell renderer
  const renderDay = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const hasPostsForDay = postsByDate[formattedDate] && postsByDate[formattedDate].length > 0;
    const postsForDay = hasPostsForDay ? postsByDate[formattedDate] : [];
    
    return (
      <div
        key={day.toString()}
        className={`min-h-[120px] p-2 border border-gray-200 ${
          !isSameMonth(day, monthStart)
            ? 'bg-gray-100 text-gray-400'
            : isToday(day)
            ? 'bg-blue-50 border-blue-200'
            : ''
        }`}
      >
        <div className="font-medium text-sm">
          {format(day, 'd')}
          {isToday(day) && (
            <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
              •
            </span>
          )}
        </div>
        
        {hasPostsForDay && (
          <div className="mt-1 space-y-1">
            {postsForDay.map(post => (
              <Link 
                key={post.id} 
                href={`/posts/${post.id}`}
                className="block"
              >
                <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate">
                  {format(new Date(post.scheduledFor), 'h:mm a')} - {post.content.substring(0, 20)}...
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
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
            <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(day => renderDay(day))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Click on a post to edit or reschedule it.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;