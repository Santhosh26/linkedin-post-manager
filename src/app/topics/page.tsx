// src/app/topics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopicsList from '@/components/topics/TopicsList';

interface Topic {
  id: string;
  name: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Handle topic deletion
  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }

      // Remove the deleted topic from state
      setTopics(topics.filter((topic) => topic.id !== id));
    } catch (err) {
      console.error('Error deleting topic:', err);
      setError('Failed to delete topic. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Topics</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <TopicsList topics={topics} onDelete={handleDeleteTopic} />
        )}
      </div>
    </DashboardLayout>
  );
}