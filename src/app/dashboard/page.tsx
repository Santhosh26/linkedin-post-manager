// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Plus, FileText, List, Calendar, CheckCircle2, Newspaper, Loader2 } from 'lucide-react';
// Ensure Card components are imported correctly from your adapter
import { Card, CardHeader, CardContent } from '@/components/ui/cardAdapter';
import { Button } from '@/components/ui/buttonAdapter';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

// Define interfaces used within this component
interface Stats {
  totalPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalTopics: number;
}

interface Post {
  id: string;
  content: string;
  hashtags: string[];
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  topicId?: string;
  topic?: {
    name: string;
  };
  // Add other relevant post fields if needed by the UI
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  // Use session hook to access user data if needed by the page content
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    totalTopics: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for data fetching
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const fetchData = async () => {
      // --- GUARD CLAUSE ---
      // Ensure session and user exist before attempting to fetch data
      if (!session?.user) {
        console.log("DashboardPage: No session user yet, skipping data fetch.");
        // If session isn't ready yet, don't set loading to false immediately
        // Keep loading until session status is definitive
        if (session === undefined) { // Checking explicitly for initial loading state
            setIsLoading(true);
        } else {
            setIsLoading(false); // Session is loaded but no user (shouldn't happen with server layout)
            setError("User session not found.");
        }
        return;
      }
      // --- END GUARD CLAUSE ---

      console.log("DashboardPage: Session user found, fetching data...");
      setIsLoading(true); // Start loading indicator
      setError(null); // Clear previous errors

      try {
        // Fetch all required data concurrently
        const [postsResponse, topicsResponse] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/topics')
        ]);

        if (!postsResponse.ok) throw new Error(`Failed to fetch posts: ${postsResponse.statusText}`);
        const posts: Post[] = await postsResponse.json();

        if (!topicsResponse.ok) throw new Error(`Failed to fetch topics: ${topicsResponse.statusText}`);
        const topics: { id: string }[] = await topicsResponse.json(); // Assuming topics is an array of objects with at least 'id'

        // Calculate stats
        const draftPostsCount = posts.filter((post) => post.status === 'DRAFT').length;
        const scheduledPostsCount = posts.filter((post) => post.status === 'SCHEDULED').length;
        const publishedPostsCount = posts.filter((post) => post.status === 'PUBLISHED').length;

        setStats({
          totalPosts: posts.length,
          draftPosts: draftPostsCount,
          scheduledPosts: scheduledPostsCount,
          publishedPosts: publishedPostsCount,
          totalTopics: topics.length,
        });

        // Get 5 most recent posts (assuming posts are sorted by date descending from API)
        setRecentPosts(posts.slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false); // Stop loading indicator
      }
    };

    fetchData();
    // Depend on session and session.user to re-trigger fetch when user becomes available or changes
  }, [session, session?.user]);

  // Helper function for status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
      case 'SCHEDULED':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'PUBLISHED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  // Loading State UI
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-muted-foreground">Loading Dashboard...</span>
      </div>
    );
  }

  // Error State UI
  if (error) {
      return (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
              <h3 className="font-semibold">Error Loading Dashboard</h3>
              <p>{error}</p>
              <Button variant="destructive" size="sm" onClick={() => window.location.reload()} className="mt-2">
                  Try Reloading
              </Button>
          </div>
      );
  }

  // Main Dashboard Content (rendered when not loading and no error)
  // The outer layout (Navbar, Sidebar, main container) is provided by src/app/dashboard/layout.tsx
  // The Card wrapper is also provided by the layout.tsx
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Dashboard</h1>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3 text-foreground">Quick Actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
           <Link href="/topics/new" className="block hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">New Topic</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Create a new content topic</p>
                </div>
              </div>
            </Link>
            {/* Other Action Links... */}
            <Link href="/posts/new" className="block hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">Create Post</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Write a new LinkedIn post</p>
                </div>
              </div>
            </Link>
             <Link href="/topics" className="block hover:translate-y-[-2px] transition-transform duration-200">
               <div className="p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-center group">
                 <div className="flex flex-col items-center">
                   <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                     <List className="h-6 w-6" />
                   </div>
                   <h3 className="text-base font-medium text-foreground">Research Content</h3>
                   <p className="mt-2 text-sm text-muted-foreground">Research topics for new posts</p>
                 </div>
               </div>
             </Link>
            <Link href="/calendar" className="block hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow text-center group">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">View Calendar</h3>
                  <p className="mt-2 text-sm text-muted-foreground">See your content schedule</p>
                </div>
              </div>
            </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3 text-foreground">Overview</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
           {/* Stat Cards... */}
           <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-1 rounded-md p-3">
                    <Newspaper className="h-6 w-6 text-white" /> {/* Assuming text-card is white-ish */}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.totalPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-5 rounded-md p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Draft Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.draftPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-3 rounded-md p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Scheduled Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.scheduledPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-2 rounded-md p-3">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Published Posts</dt>
                      <dd>
                        <div className="text-lg font-medium text-foreground">{stats.publishedPosts}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-chart-4 rounded-md p-3">
                    <List className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-muted-foreground truncate">Total Topics</dt>
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
        {/* Using the Card adapter */}
        <Card className="border border-border shadow-sm">
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
              <div className="divide-y divide-border">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-4 group">
                    <div className="flex justify-between items-start gap-4">
                      <div className='flex-1 min-w-0'> {/* Allow content to wrap */}
                        <p className="text-sm font-medium line-clamp-2 text-foreground break-words">
                          {post.content}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge className={cn("text-xs", getStatusStyle(post.status))}>
                            {post.status}
                          </Badge>
                          {post.topic && (
                             <Badge variant="outline" className="text-xs">
                              {post.topic.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {/* Ensure button doesn't prevent text wrapping */}
                      <div className="flex-shrink-0 ml-4">
                        <Link href={`/posts/${post.id}`}>
                            <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                Edit
                            </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <p>No posts created yet.</p>
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

    </div> // End of the main page content div
  );
}