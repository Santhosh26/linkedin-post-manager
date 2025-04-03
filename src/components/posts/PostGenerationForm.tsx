// src\components\posts\PostGenerationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useResearchContext } from '@/lib/contexts/ResearchContext';

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

interface PostGenerationFormProps {
  topicId: string;
  topicName: string;
  researchId: string;
  selectedResearchData?: ResearchData | null;
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

// Helper function to get domain from URL
const getDomain = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
};

const PostGenerationForm = ({ 
  topicId, 
  topicName, 
  researchId,
  selectedResearchData 
}: PostGenerationFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { getResearchData } = useResearchContext();
  const [tone, setTone] = useState<'professional' | 'casual' | 'thoughtful'>('professional');
  const [variationCount, setVariationCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[] | null>(null);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);

  // Get research data from context if not provided directly
  const researchData = selectedResearchData || getResearchData(researchId);

  const generatePosts = async () => {
    if (!researchData || researchData.results.length === 0) {
      setError('No research data available. Please go back and select some research results.');
      toast({
        title: "No Research Data",
        description: "Please select research sources before generating posts.",
        variant: "destructive",
      });
      return;
    }

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
          researchData, // Pass the selected research data
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div>
            <h2 className="text-xl font-semibold">Generate LinkedIn Posts</h2>
            <p className="text-sm text-muted-foreground">Topic: {topicName}</p>
          </div>
          {researchData && (
            <Badge variant="outline" className="text-sm whitespace-nowrap">
              {researchData.results.length} source{researchData.results.length !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>
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

        {!researchData || researchData.results.length === 0 ? (
          <div className="mb-6 bg-muted border-l-4 border-amber-500 p-4 rounded">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="ml-3">
                <p className="text-sm font-medium">No research sources selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please go back and select some research results before generating posts.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Collapsible 
            open={isSourcesExpanded} 
            onOpenChange={setIsSourcesExpanded} 
            className="mb-6 bg-muted/50 border rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">
                      Using {researchData.results.length} source{researchData.results.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isSourcesExpanded ? 'Hide sources' : 'Show sources'}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium">Research query:</span> &quot;{researchData.query}&quot;
                </p>
                {researchData.results.map((result, index) => (
                  <div key={index} className="text-sm border-t pt-2 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium line-clamp-1">{result.title}</span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary/90 transition-colors text-xs ml-2 whitespace-nowrap"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {getDomain(result.url)}
                      </a>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
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
            disabled={isLoading || !researchData || researchData.results.length === 0}
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