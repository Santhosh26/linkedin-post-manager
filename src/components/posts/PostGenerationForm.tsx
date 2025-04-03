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
        <p className="text-sm text-muted-foreground">Topic: {topicName}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="ml-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!generatedPosts ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Tone
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'professional' 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-muted hover:border-primary/30'
                  }`}
                  onClick={() => setTone('professional')}
                >
                  <div className="font-medium text-center mb-2">Professional</div>
                  <p className="text-xs text-center text-muted-foreground">
                    Formal, authoritative tone for business audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'casual' 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-muted hover:border-primary/30'
                  }`}
                  onClick={() => setTone('casual')}
                >
                  <div className="font-medium text-center mb-2">Casual</div>
                  <p className="text-xs text-center text-muted-foreground">
                    Conversational, friendly tone for general audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    tone === 'thoughtful' 
                      ? 'border-primary bg-primary/10 shadow-sm' 
                      : 'border-muted hover:border-primary/30'
                  }`}
                  onClick={() => setTone('thoughtful')}
                >
                  <div className="font-medium text-center mb-2">Thoughtful</div>
                  <p className="text-xs text-center text-muted-foreground">
                    Reflective, insightful tone for deeper engagement
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Variations: <span className="font-bold text-primary">{variationCount}</span>
              </label>
              <div className="w-full px-1">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={variationCount} 
                  onChange={(e) => setVariationCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Fewer</span>
                <span>More</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center p-4 mb-4 text-success-foreground border-l-4 border-success bg-success/10 rounded">
              <Check className="h-6 w-6 mr-2 text-success" /> 
              <span className="font-medium">Successfully generated {generatedPosts.length} posts</span>
            </div>
            
            <div className="overflow-hidden bg-muted border border-border rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium">
                  Post Preview
                </h3>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p className="mb-1">Generated {generatedPosts.length} LinkedIn posts with <span className="font-medium text-primary">{tone}</span> tone.</p>
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
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary-foreground rounded-full"></span>
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