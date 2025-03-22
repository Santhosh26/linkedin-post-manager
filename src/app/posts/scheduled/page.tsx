// src/app/posts/scheduled/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiFilter, FiBarChart2, FiMoreVertical } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import ScheduledPostControls from '@/components/posts/ScheduledPostControls';
import CronTrigger from '@/components/admin/CronTrigger';

interface Post {
  id: string;
  content: string;
  hashtags: string[];
  status: 'SCHEDULED';
  scheduledFor: string;
  topicId?: string;
  topic?: {
    name: string;
  };
  visibility: 'PUBLIC' | 'CONNECTIONS';
}

export default function ScheduledPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Fetch scheduled posts
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setLoading(true);
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

  // Handle successful publishing
  const handlePublishSuccess = (postId: string) => {
    // Remove the post from the list
    setPosts(posts.filter(post => post.id !== postId));
    // Show success message or refresh
    router.refresh();
  };
  
  // Sort posts by scheduled time
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.scheduledFor).getTime();
    const dateB = new Date(b.scheduledFor).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Scheduled Posts</h1>

        {/* Display the CronTrigger only in development environment */}
        {process.env.NODE_ENV === 'development' && <CronTrigger />}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader 
            title="Your Scheduled Posts" 
            action={
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <FiBarChart2 className="mr-2" />
                  {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
                </Button>
              </div>
            }
          />
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : sortedPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <ScheduledPostControls 
                      postId={post.id} 
                      scheduledTime={post.scheduledFor}
                      onSuccess={() => handlePublishSuccess(post.id)}
                    />
                    
                    <div className="mt-2">
                      <p className="text-gray-900 dark:text-dark-text-primary mb-2">
                        {post.content.substring(0, 200)}
                        {post.content.length > 200 ? '...' : ''}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.hashtags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-dark-text-tertiary">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          <span>
                            {new Date(post.scheduledFor).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="mr-2">
                            Visibility: {post.visibility === 'PUBLIC' ? 'Public' : 'Connections Only'}
                          </span>
                          
                          {post.topic && (
                            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs">
                              {post.topic.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No scheduled posts</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
                  You dont have any posts scheduled for publishing.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => router.push('/posts/new')} 
                    variant="primary"
                  >
                    Create New Post
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}