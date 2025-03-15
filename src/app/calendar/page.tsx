// src/app/calendar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        const response = await fetch('/api/posts?status=SCHEDULED');
        if (!response.ok) {
          throw new Error('Failed to fetch scheduled posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching scheduled posts:', err);
        setError('Failed to load scheduled posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledPosts();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h1>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Calendar posts={posts} />
        )}
      </div>
    </DashboardLayout>
  );
}