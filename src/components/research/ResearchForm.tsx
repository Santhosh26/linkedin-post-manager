// src/components/research/ResearchForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiSearch } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { useResearchContext } from '@/lib/contexts/ResearchContext';

const researchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  maxResults: z.number().int().min(1).max(20).optional(),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

interface ResearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

interface ResearchData {
  query: string;
  results: ResearchResult[];
}

interface ResearchFormProps {
  topicId: string;
  topicName: string;
  onResearchComplete: (researchId: string, results: ResearchData) => void;
}

const ResearchForm = ({ topicId, topicName, onResearchComplete }: ResearchFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { researchData, researchId, topicId: contextTopicId } = useResearchContext();
  
  // If we have cached research data for this topic, use it
  const hasCachedData = researchData && contextTopicId === topicId && researchId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      query: hasCachedData ? researchData.query : '',
      maxResults: 10,
    },
  });

  // If we have cached research data, pass it to the parent component
  useEffect(() => {
    if (hasCachedData && researchId) {
      onResearchComplete(researchId, researchData);
    }
  }, [hasCachedData, researchId, researchData, onResearchComplete]);

  const onSubmit = async (data: ResearchFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          query: data.query,
          maxResults: data.maxResults,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to conduct research');
      }

      onResearchComplete(result.id, result.results);
    } catch (err) {
      console.error('Error conducting research:', err);
      setError(err instanceof Error ? err.message : 'Failed to conduct research');
    } finally {
      setIsLoading(false);
    }
  };

  // If we already have cached data, don't show the form
  if (hasCachedData) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader title={`Research for: ${topicName}`} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <Input
              id="query"
              label="Search Query"
              placeholder="Enter a specific query related to your topic"
              {...register('query')}
              error={errors.query?.message}
            />

            <div>
              <label
                htmlFor="maxResults"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Results
              </label>
              <select
                id="maxResults"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                {...register('maxResults', { valueAsNumber: true })}
              >
                <option value={5}>5 results</option>
                <option value={10}>10 results</option>
                <option value={15}>15 results</option>
                <option value={20}>20 results</option>
              </select>
              {errors.maxResults && (
                <p className="mt-1 text-sm text-red-600">{errors.maxResults.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Researching...
              </span>
            ) : (
              <span className="flex items-center">
                <FiSearch className="mr-2" />
                Start Research
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResearchForm;