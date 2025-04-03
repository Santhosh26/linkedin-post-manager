// src/app/topics/[id]/research/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ResearchForm from '@/components/research/ResearchForm';
import ResearchResults from '@/components/research/ResearchResults';
import { useResearchContext } from '@/lib/contexts/ResearchContext';

interface Topic {
  id: string;
  name: string;
  keywords: string[];
}

// Define shared interfaces at the top level
export interface ResearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface ResearchData {
  query: string;
  results: ResearchResult[];
}

export default function TopicResearchPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [localResearchId, setLocalResearchId] = useState<string | null>(null);
  const [localResearchResults, setLocalResearchResults] = useState<ResearchData | null>(null);
  
  // Get the research context
  const { researchId, researchData, topicId: contextTopicId } = useResearchContext();

  // Fetch topic
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
        setError('Failed to load topic. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  // Set local state from context if available for this topic
  useEffect(() => {
    if (researchData && researchId && contextTopicId === topicId) {
      setLocalResearchId(researchId);
      setLocalResearchResults(researchData);
    }
  }, [researchData, researchId, contextTopicId, topicId]);

  const handleResearchComplete = (id: string, results: ResearchData) => {
    setLocalResearchId(id);
    setLocalResearchResults(results);
  };

  const handleGeneratePosts = () => {
    if (localResearchId) {
      router.push(`/topics/${topicId}/research/${localResearchId}/generate`);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Research Content</h1>
        
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
          <div className="space-y-8">
            {!localResearchResults ? (
              <ResearchForm 
                topicId={topic.id} 
                topicName={topic.name} 
                onResearchComplete={handleResearchComplete} 
              />
            ) : (
              <ResearchResults 
                topicId={topic.id}
                topicName={topic.name}
                researchId={localResearchId!}
                results={localResearchResults}
                onGeneratePosts={handleGeneratePosts}
              />
            )}
          </div>
        ) : (
          <Alert variant="destructive" className="border-l-4 border-yellow-500">
            <AlertDescription>Topic not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}