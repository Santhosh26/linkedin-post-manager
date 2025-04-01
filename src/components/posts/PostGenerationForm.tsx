// src/components/posts/PostGenerationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

interface PostGenerationFormProps {
  topicId: string;
  topicName: string;
  researchId: string;
}

interface GeneratedPost {
  id: string;
  content: string;
  hashtags: string[];
  topicId: string;
  userId: string;
  status: 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

const PostGenerationForm = ({ topicId, topicName, researchId }: PostGenerationFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [tone, setTone] = useState<'professional' | 'casual' | 'thoughtful'>('professional');
  const [variationCount, setVariationCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[] | null>(null);

  const generatePosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts?action=generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId,
          researchId,
          tone,
          variationCount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate posts');
      }

      toast({
        title: "Posts Generated",
        description: `Successfully generated ${result.posts.length} posts.`,
      });

      setGeneratedPosts(result.posts);
    } catch (err) {
      console.error('Error generating posts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate posts';
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewAllPosts = () => {
    router.push('/posts');
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Generate LinkedIn Posts</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Topic: {topicName}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!generatedPosts ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Select Tone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'professional' 
                      ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  onClick={() => setTone('professional')}
                >
                  <div className="font-medium text-center text-foreground dark:text-dark-text-primary mb-2">Professional</div>
                  <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                    Formal, authoritative tone for business audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'casual' 
                      ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  onClick={() => setTone('casual')}
                >
                  <div className="font-medium text-center text-foreground dark:text-dark-text-primary mb-2">Casual</div>
                  <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                    Conversational, friendly tone for general audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'thoughtful' 
                      ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  onClick={() => setTone('thoughtful')}
                >
                  <div className="font-medium text-center text-foreground dark:text-dark-text-primary mb-2">Thoughtful</div>
                  <p className="text-xs text-center text-gray-500 dark:text-dark-text-tertiary">
                    Reflective, insightful tone for deeper engagement
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Number of Variations: <span className="font-bold text-primary-600 dark:text-primary-400">{variationCount}</span>
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={variationCount} 
                  onChange={(e) => setVariationCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Fewer</span>
                <span>More</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center p-4 mb-4 text-green-800 dark:text-green-300 border-l-4 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20 rounded">
              <Check className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" /> 
              <span className="font-medium">Successfully generated {generatedPosts.length} posts</span>
            </div>
            
            <div className="overflow-hidden bg-gray-50 dark:bg-dark-bg-tertiary border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-foreground dark:text-dark-text-primary">
                  Post Preview
                </h3>
                <div className="mt-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                  <p className="mb-1">Generated {generatedPosts.length} LinkedIn posts with <span className="font-medium text-primary-600 dark:text-primary-400">{tone}</span> tone.</p>
                  <p>Visit your Posts page to view, edit, and schedule them.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Back
        </Button>
        
        {!generatedPosts ? (
          <Button 
            onClick={generatePosts}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Generating...
              </span>
            ) : (
              'Generate Posts'
            )}
          </Button>
        ) : (
          <Button onClick={viewAllPosts}>
            View All Posts
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PostGenerationForm;