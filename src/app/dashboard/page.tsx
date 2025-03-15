// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiPlus, FiFileText, FiList, FiCalendar } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Stats {
  totalPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalTopics: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalTopics: 0,
  });
  interface Post {
    id: string;
    content: string;
    hashtags: string[];
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
    topicId?: string;
    topic?: {
      name: string;
    };
  }
  
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts for stats
        const postsResponse = await fetch('/api/posts');
        if (!postsResponse.ok) throw new Error('Failed to fetch posts');
        const posts = await postsResponse.json();

        // Fetch topics for stats
        const topicsResponse = await fetch('/api/topics');
        if (!topicsResponse.ok) throw new Error('Failed to fetch topics');
        const topics = await topicsResponse.json();

        // Calculate stats
        const draftPosts = posts.filter((post: any) => post.status === 'DRAFT');
        const scheduledPosts = posts.filter((post: any) => post.status === 'SCHEDULED');
        const publishedPosts = posts.filter((post: any) => post.status === 'PUBLISHED');

        setStats({
          totalPosts: posts.length,
          draftPosts: draftPosts.length,
          scheduledPosts: scheduledPosts.length,
          publishedPosts: publishedPosts.length,
          totalTopics: topics.length,
        });

        // Get 5 most recent posts
        setRecentPosts(posts.slice(0, 5));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/topics/new" className="block">
              <div className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <FiPlus className="h-6 w-6 text-blue-500" />
                  <h3 className="ml-3 text-base font-medium text-gray-900">New Topic</h3>
                </div>
              </div>
            </Link>

            <Link href="/posts/new" className="block">
              <div className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <FiFileText className="h-6 w-6 text-blue-500" />
                  <h3 className="ml-3 text-base font-medium text-gray-900">Create Post</h3>
                </div>
              </div>
            </Link>

            <Link href="/calendar" className="block">
              <div className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <FiCalendar className="h-6 w-6 text-blue-500" />
                  <h3 className="ml-3 text-base font-medium text-gray-900">View Calendar</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FiFileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FiFileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Draft Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.draftPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FiCalendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.scheduledPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FiFileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Published Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.publishedPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FiList className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Topics</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalTopics}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mt-8">
          <Card>
            <CardHeader 
              title="Recent Posts" 
              action={
                <Link href="/posts">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {recentPosts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                                post.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-green-100 text-green-800'}`}>
                              {post.status}
                            </span>
                            {post.topic && (
                              <span className="ml-2 text-xs text-gray-500">
                                {post.topic.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/posts/${post.id}`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  <p>No posts created yet</p>
                  <div className="mt-4">
                    <Link href="/posts/new">
                      <Button>Create Your First Post</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}