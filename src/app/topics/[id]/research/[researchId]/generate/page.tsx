// src/app/topics/[id]/research/[researchId]/generate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PostGenerationForm from '@/components/posts/PostGenerationForm';
import { useResearchContext } from '@/lib/contexts/ResearchContext';

interface Topic {
  id: string;
  name: string;
}

export default function GeneratePostsPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;
  const researchId = params.researchId as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the research context
  const { researchId: contextResearchId, topicId: contextTopicId } = useResearchContext();

  // Redirect to research page if no research context is available
  useEffect(() => {
    if (!contextResearchId || contextTopicId !== topicId) {
      // We don't have the research data in context, redirect back to research
      router.push(`/topics/${topicId}/research`);
    }
  }, [contextResearchId, contextTopicId, topicId, router]);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch(`/api/topics/${topicId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch topic');
        }
        const data = await response.json();
        setTopic(data);
      } catch (err) {
        console.error('Error fetching topic:', err);
        setError('Failed to load topic information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Generate LinkedIn Posts</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : topic ? (
          <PostGenerationForm 
            topicId={topicId} 
            topicName={topic.name}
            researchId={researchId}
          />
        ) : (
          <Alert variant="destructive" className="border-l-4 border-yellow-500">
            <AlertDescription>Topic not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}