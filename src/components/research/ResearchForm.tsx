'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useResearchContext } from '@/lib/contexts/ResearchContext';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


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
    setValue,
    watch,
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <div className="bg-muted px-4 py-2 border-b flex items-center text-sm">
        <Link href="/topics" className="text-muted-foreground hover:text-primary transition-colors">
          Topics
        </Link>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2 text-muted-foreground">
          <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor"></path>
        </svg>
        <span className="font-medium text-foreground">{topicName}</span>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2 text-muted-foreground">
          <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor"></path>
        </svg>
        <span className="text-muted-foreground">Research</span>
      </div>
      <CardHeader title={`Research for: ${topicName}`} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-4 bg-destructive/10 border-l-4 border-destructive p-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 mb-4">
            <div className="bg-muted border-l-4 border-primary p-4 mb-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-foreground">
                    Enter a specific search query related to your topic. The more specific your query, the better results you&apos;ll get.
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
                className="block text-sm font-medium mb-1"
              >
                Max Results
              </label>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full justify-between"
                    >
                      {watch('maxResults') || 10} results
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4">
                        <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor"></path>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {[5, 10, 15, 20].map((value) => (
                      <DropdownMenuItem 
                        key={value} 
                        onClick={() => {
                          setValue('maxResults', value, { shouldValidate: true });
                        }}
                      >
                        {value} results
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  type="hidden"
                  id="maxResults"
                  {...register('maxResults', { valueAsNumber: true })}
                />
                {errors.maxResults && (
                  <p className="mt-1 text-sm text-destructive">{errors.maxResults.message}</p>
                )}
              </div>
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
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
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