// src/components/research/ResearchResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiExternalLink, FiFileText } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
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

interface ResearchResultsProps {
  topicId: string;
  topicName: string;
  researchId: string;
  results: ResearchData;
  onGeneratePosts: () => void;
}

const ResearchResults = ({
  topicId,
  topicName,
  researchId,
  results,
  onGeneratePosts,
}: ResearchResultsProps) => {
  const [expandedResults, setExpandedResults] = useState<string[]>([]);
  const { setResearchState } = useResearchContext();

  // Store the research data in context when the component mounts
  useEffect(() => {
    setResearchState(researchId, results, topicId);
  }, [researchId, results, topicId, setResearchState]);

  const toggleExpand = (url: string) => {
    setExpandedResults((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  return (
    <Card>
      <CardHeader
        title="Research Results"
        subtitle={`Query: "${results.query}"`}
      />
      <CardContent>
        <div className="space-y-6">
          {results.results.length > 0 ? (
            results.results.map((result, index) => (
              <div
                key={index}
                className="bg-white shadow overflow-hidden rounded-lg border"
              >
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {result.title}
                    </h3>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FiExternalLink className="h-5 w-5 mr-1" />
                      Source
                    </a>
                  </div>
                  {result.published_date && (
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Published: {new Date(result.published_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div
                      className={`prose max-w-none ${
                        !expandedResults.includes(result.url) ? 'line-clamp-3' : ''
                      }`}
                    >
                      {result.content}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(result.url)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {expandedResults.includes(result.url) ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No results found for this query.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back to Topics
        </Button>
        {results.results.length > 0 && (
          <Button onClick={onGeneratePosts}>
            <FiFileText className="mr-2" />
            Generate LinkedIn Posts
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResearchResults;