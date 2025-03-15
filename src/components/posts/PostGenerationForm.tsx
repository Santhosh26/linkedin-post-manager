// src/components/posts/PostGenerationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

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
      const response = await fetch('/api/posts', {
        method: 'PUT',
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

      setGeneratedPosts(result.posts);
    } catch (err) {
      console.error('Error generating posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate posts');
    } finally {
      setIsLoading(false);
    }
  };

  const viewAllPosts = () => {
    router.push('/posts');
  };

  return (
    <Card>
      <CardHeader 
        title="Generate LinkedIn Posts" 
        subtitle={`Topic: ${topicName}`}
      />
      <CardContent>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!generatedPosts ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className={`cursor-pointer p-4 rounded-lg border ${
                    tone === 'professional' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setTone('professional')}
                >
                  <div className="font-medium text-center mb-2">Professional</div>
                  <p className="text-xs text-center text-gray-500">
                    Formal, authoritative tone for business audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border ${
                    tone === 'casual' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setTone('casual')}
                >
                  <div className="font-medium text-center mb-2">Casual</div>
                  <p className="text-xs text-center text-gray-500">
                    Conversational, friendly tone for general audience
                  </p>
                </div>
                <div 
                  className={`cursor-pointer p-4 rounded-lg border ${
                    tone === 'thoughtful' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setTone('thoughtful')}
                >
                  <div className="font-medium text-center mb-2">Thoughtful</div>
                  <p className="text-xs text-center text-gray-500">
                    Reflective, insightful tone for deeper engagement
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Variations
              </label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={variationCount} 
                  onChange={(e) => setVariationCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">{variationCount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-green-600 font-medium flex items-center">
              <FiCheck className="mr-2" /> 
              Successfully generated {generatedPosts.length} posts
            </p>
            
            <div className="overflow-hidden bg-gray-50 border border-gray-200 rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Post Preview
                </h3>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="mb-1">Generated {generatedPosts.length} LinkedIn posts with {tone} tone.</p>
                  <p>Visit your Posts page to view, edit, and schedule them.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
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