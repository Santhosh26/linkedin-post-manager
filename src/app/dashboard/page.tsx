// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, FileText, List, Calendar } from 'lucide-react';
import { CheckCircle2 } from "lucide-react";
import { Newspaper } from "lucide-react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/cardAdapter';
import { Button } from '@/components/ui/buttonAdapter';

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
      } catch (err) {
        console.error('Error fetching dashboard data:', err);

      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-foreground mb-3">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/topics/new" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-white rounded-[1rem] border border-gray-200 hover:shadow-bubble transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">New Topic</h3>
                  <p className="mt-2 text-sm text-gray-500">Create a new content topic</p>
                </div>
              </div>
            </Link>

            <Link href="/posts/new" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-white rounded-[1rem] border border-gray-200 hover:shadow-bubble transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">Create Post</h3>
                  <p className="mt-2 text-sm text-gray-500">Write a new LinkedIn post</p>
                </div>
              </div>
            </Link>

            <Link href="/topics" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-white rounded-[1rem] border border-gray-200 hover:shadow-bubble transition-all text-center group ">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors ">
                    <List className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground ">Research Content</h3>
                  <p className="mt-2 text-sm text-gray-500">Research topics for new posts</p>
                </div>
              </div>
            </Link>

            <Link href="/calendar" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-white rounded-[1rem] border border-gray-200 hover:shadow-bubble transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-200 transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">View Calendar</h3>
                  <p className="mt-2 text-sm text-gray-500">See your content schedule</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-3">Overview</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white overflow-hidden shadow-bubble rounded-[1rem] border border-gray-200 ">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                    <Newspaper className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.totalPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-bubble rounded-[1rem] border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Draft Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.draftPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-bubble rounded-[1rem] border border-gray-200 ">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.scheduledPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-bubble rounded-[1rem] border border-gray-200 l">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Published Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.publishedPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-bubble rounded-[1rem] border border-gray-200 ">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <List className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Topics</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.totalTopics}</div>
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
                  <Button variant="default" size="sm">
                    View All
                  </Button>
                </Link>
              }
            />
            <CardContent>
              {recentPosts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="py-4 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {post.content}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                                post.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-green-100 text-green-800'}`}>
                              {post.status}
                            </span>
                            {post.topic && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {post.topic.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/posts/${post.id}`}>
                          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
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