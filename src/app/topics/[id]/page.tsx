// src/app/topics/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopicForm from '@/components/topics/TopicForm';

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EditTopicPage() {
  const params = useParams();
  const topicId = params.id as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Topic</h1>
        
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
          <TopicForm initialData={topic} isEditMode />
        ) : (
          <Alert variant="destructive" className="border-l-4 border-yellow-500">
            <AlertDescription>Topic not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}