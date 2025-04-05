// src/app/posts/scheduled/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, BarChart2, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/ClientDashboardLayout';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent } from '@/components/ui/cardAdapter';
import ScheduledPostControls from '@/components/posts/ScheduledPostControls';
import CronTrigger from '@/components/admin/CronTrigger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Scheduled Posts</h1>

        {/* Display the CronTrigger only in development environment */}
        {process.env.NODE_ENV === 'development' && <CronTrigger />}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                  <BarChart2 className="mr-2 h-4 w-4" />
                  {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
                </Button>
              </div>
            }
          />
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : sortedPosts.length > 0 ? (
              <div className="space-y-4">
                {sortedPosts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <ScheduledPostControls 
                      postId={post.id} 
                      scheduledTime={post.scheduledFor}
                      onSuccess={() => handlePublishSuccess(post.id)}
                    />
                    
                    <div className="mt-2">
                      <p className="mb-2">
                        {post.content.substring(0, 200)}
                        {post.content.length > 200 ? '...' : ''}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.hashtags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>
                            {new Date(post.scheduledFor).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="mr-2">
                            Visibility: {post.visibility === 'PUBLIC' ? 'Public' : 'Connections Only'}
                          </span>
                          
                          {post.topic && (
                            <Badge variant="outline" className="text-xs">
                              {post.topic.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No scheduled posts</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You don&apos;t have any posts scheduled for publishing.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => router.push('/posts/new')} 
                    variant="default"
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