// src/app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/ClientDashboardLayout';
import PostForm from '@/components/posts/PostForm';
import LinkedInShareButton from '@/components/posts/LinkedInShareButton';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Post {
  id: string;
  content: string;
  hashtags: string[];
  topicId?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  linkedinPostId?: string;
  linkedinPostUrl?: string;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedToLinkedIn, setSharedToLinkedIn] = useState(false);
  const [linkedinPostUrl, setLinkedinPostUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
        
        // Check if the post has already been shared to LinkedIn
        if (data.linkedinPostUrl) {
          setSharedToLinkedIn(true);
          setLinkedinPostUrl(data.linkedinPostUrl);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLinkedInShareSuccess = (url: string) => {
    setSharedToLinkedIn(true);
    setLinkedinPostUrl(url);
    
    // Update the post state to reflect the published status
    if (post) {
      setPost({
        ...post,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        linkedinPostUrl: url
      });
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : post ? (
          <div className="space-y-6">
            <PostForm initialData={post} isEditMode />
            
            {/* LinkedIn Sharing Section */}
            <Card>
              <CardContent className="py-5">
                <h2 className="text-lg font-medium mb-4">Share to LinkedIn</h2>
                
                {sharedToLinkedIn ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <p className="text-success-foreground font-medium">
                          Successfully shared to LinkedIn
                        </p>
                        {linkedinPostUrl && (
                          <a 
                            href={linkedinPostUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center mt-2 text-sm text-success hover:text-success/80"
                          >
                            <span>View on LinkedIn</span>
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    </div>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">
                      Share this post directly to your LinkedIn profile with one click.
                    </p>
                    <LinkedInShareButton 
                      postId={postId} 
                      onSuccess={handleLinkedInShareSuccess} 
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert variant="default" className="bg-muted border-l-4 border-muted-foreground/50">
            <AlertDescription className="text-muted-foreground">
              Post not found
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}