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
import { cn } from "@/lib/utils";

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

  // Helper function for status badge styling
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'DRAFT':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'SCHEDULED':
        return 'bg-primary/10 text-primary';
      case 'PUBLISHED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/topics/new" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-card rounded-lg border shadow-sm hover:shadow transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium">New Topic</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Create a new content topic</p>
                </div>
              </div>
            </Link>

            <Link href="/posts/new" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-card rounded-lg border shadow-sm hover:shadow transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium">Create Post</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Write a new LinkedIn post</p>
                </div>
              </div>
            </Link>

            <Link href="/topics" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-card rounded-lg border shadow-sm hover:shadow transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <List className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium">Research Content</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Research topics for new posts</p>
                </div>
              </div>
            </Link>

            <Link href="/calendar" className="block hover:translate-y-[-2px] transition-all">
              <div className="p-6 bg-card rounded-lg border shadow-sm hover:shadow transition-all text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium">View Calendar</h3>
                  <p className="mt-2 text-sm text-muted-foreground">See your content schedule</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">Overview</h2>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-card overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-1 rounded-md p-3">
                    <Newspaper className="h-6 w-6 text-card" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Posts</dt>
                      <dd>
                        <div className="text-lg font-medium">{stats.totalPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-5 rounded-md p-3">
                    <FileText className="h-6 w-6 text-card" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Draft Posts</dt>
                      <dd>
                        <div className="text-lg font-medium">{stats.draftPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-3 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-card" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Scheduled Posts</dt>
                      <dd>
                        <div className="text-lg font-medium">{stats.scheduledPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-2 rounded-md p-3">
                    <CheckCircle2 className="h-6 w-6 text-card" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Published Posts</dt>
                      <dd>
                        <div className="text-lg font-medium">{stats.publishedPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-4 rounded-md p-3">
                    <List className="h-6 w-6 text-card" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Topics</dt>
                      <dd>
                        <div className="text-lg font-medium">{stats.totalTopics}</div>
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
                <div className="divide-y">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="py-4 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium line-clamp-2">
                            {post.content}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getStatusStyle(post.status)
                            )}>
                              {post.status}
                            </span>
                            {post.topic && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
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
                <div className="py-6 text-center text-muted-foreground">
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