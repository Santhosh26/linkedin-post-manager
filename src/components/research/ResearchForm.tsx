// src/components/research/ResearchForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Info } from 'lucide-react';
import {Input} from '@/components/ui/input';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useResearchContext } from '@/lib/contexts/ResearchContext';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { researchData, researchId, topicId: contextTopicId } = useResearchContext();
  
  // If we have cached research data for this topic, use it
  const hasCachedData = researchData && contextTopicId === topicId && researchId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    
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

      toast({
        title: "Research Complete",
        description: `Research completed with ${result.results.results.length} results.`,
      });

      onResearchComplete(result.id, result.results);
    } catch (err) {
      console.error('Error conducting research:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to conduct research';
      setError(errorMessage);
      toast({
        title: "Research Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we already have cached data, don't show the form
  if (hasCachedData) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader title={`Research for: ${topicName}`} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 p-4 mb-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Enter a specific search query related to your topic. The more specific your query, the better results you'll get.
                  </p>
                </div>
              </div>
            </div>

            <Input
              id="query"
              label="Search Query"
              placeholder="Enter a specific query related to your topic"
              {...register('query')}
              error={errors.query?.message}
              helperText="Example: 'Latest trends in digital marketing' or 'How to improve team productivity'"
            />

            <div>
              <label
                htmlFor="maxResults"
                className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1"
              >
                Max Results
              </label>
              <select
                id="maxResults"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 
                          bg-white dark:bg-dark-bg-tertiary text-gray-900 dark:text-dark-text-primary
                          focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-600 
                          focus:border-primary-500 dark:focus:border-primary-600 
                          sm:text-sm rounded-md transition-colors"
                {...register('maxResults', { valueAsNumber: true })}
              >
                <option value={5}>5 results</option>
                <option value={10}>10 results</option>
                <option value={15}>15 results</option>
                <option value={20}>20 results</option>
              </select>
              {errors.maxResults && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxResults.message}</p>
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
                <Search className="mr-2" />
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