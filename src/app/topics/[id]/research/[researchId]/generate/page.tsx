// src/app/topics/[id]/research/[researchId]/generate/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PostGenerationForm from '@/components/posts/PostGenerationForm';
import { useResearchContext } from '@/lib/contexts/ResearchContext';
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  name: string;
}

export default function GeneratePostsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Use refs to track initialization
  const initialized = useRef(false);
  
  const topicId = params.id as string;
  const researchId = params.researchId as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  
  // Get the research context
  const { getResearchData, setResearchState } = useResearchContext();
  
  // Process URL parameters and update context once
  useEffect(() => {
    if (initialized.current) return;
    
    const selectedDataParam = searchParams.get('selectedData');
    
    if (selectedDataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(selectedDataParam));
        setSelectedData(parsedData);
        
        // Update context
        setResearchState(researchId, parsedData, topicId);
      } catch (err) {
        console.error('Error parsing selected research data:', err);
        toast({
          title: "Data Error",
          description: "There was an error processing the selected research data.",
          variant: "destructive",
        });
      }
    } else {
      // Check if we have the research in context
      const contextData = getResearchData(researchId);
      if (!contextData) {
        router.push(`/topics/${topicId}/research`);
        toast({
          title: "No Research Data",
          description: "Please select research sources before generating posts.",
          variant: "destructive",
        });
      }
    }
    
    initialized.current = true;
  }, [searchParams, researchId, topicId, router, toast, getResearchData, setResearchState]);

  // Fetch topic information
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

  // Get research data from state or context
  const researchData = selectedData || getResearchData(researchId);

  // If we're still initializing or don't have research data, show loading
  if (!initialized.current || (!researchData && !loading)) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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
            selectedResearchData={researchData}
          />
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>Topic not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}