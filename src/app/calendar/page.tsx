// src/app/calendar/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/ClientDashboardLayout';
import Calendar from '@/components/calendar/Calendar';

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor: string;
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scheduled posts
  const fetchScheduledPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts?status=SCHEDULED');
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled posts');
      }
      const data = await response.json();
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
      setError('Failed to load scheduled posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchScheduledPosts();
  }, [fetchScheduledPosts]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Calendar</h1>

        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-destructive-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Calendar 
            posts={posts}
            onRefresh={fetchScheduledPosts}
          />
        )}
      </div>
    </DashboardLayout>
  );
}