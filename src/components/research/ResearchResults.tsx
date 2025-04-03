//src\components\research\ResearchResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, FileText, ChevronDown, ChevronUp, Check, Square } from 'lucide-react';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useResearchContext } from '@/lib/contexts/ResearchContext';
import { Badge } from '@/components/ui/badge';

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
}

// Custom checkbox component to avoid radix UI issues
const SimpleCheckbox = ({ 
  checked, 
  onChange,
  id
}: { 
  checked: boolean; 
  onChange: () => void;
  id: string;
}) => (
  <div 
    id={id}
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
      checked ? 'bg-primary border-primary' : 'bg-background border-input'
    }`}
    onClick={onChange}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange();
      }
    }}
  >
    {checked && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
  </div>
);

const ResearchResults = ({
  topicId,
  topicName,
  researchId,
  results,
}: ResearchResultsProps) => {
  const router = useRouter();
  const [expandedResults, setExpandedResults] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const { setResearchState } = useResearchContext();

  // Initialize selected results once on component mount
  useEffect(() => {
    if (results?.results?.length > 0) {
      const allUrls = results.results.map(r => r.url);
      setSelectedResults(allUrls);
    }
  }, [results?.results]);

  // Store the research data in context only once on initial mount
  // or when researchId changes, not on every render
  useEffect(() => {
    // Only set state if we have valid results
    if (results?.results?.length > 0) {
      setResearchState(researchId, results, topicId);
    }
    // Don't include results in the dependency array to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [researchId, topicId, setResearchState]);

  const toggleExpand = (url: string) => {
    setExpandedResults(prev => 
      prev.includes(url) ? prev.filter(item => item !== url) : [...prev, url]
    );
  };

  const toggleResultSelection = (url: string) => {
    setSelectedResults(prev => 
      prev.includes(url) ? prev.filter(item => item !== url) : [...prev, url]
    );
  };

  const toggleSelectAll = () => {
    if (selectedResults.length === results.results.length) {
      // Deselect all
      setSelectedResults([]);
    } else {
      // Select all
      setSelectedResults(results.results.map(r => r.url));
    }
  };

  const handleGeneratePosts = () => {
    if (selectedResults.length === 0) return;
    
    // Create a filtered version of the results
    const filteredResults = {
      ...results,
      results: results.results.filter(result => selectedResults.includes(result.url))
    };
    
    // Encode the filtered results
    const encodedData = encodeURIComponent(JSON.stringify(filteredResults));
    
    // Navigate to the generate posts page
    router.push(`/topics/${topicId}/research/${researchId}/generate?selectedData=${encodedData}`);
  };

  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  const isAllSelected = results.results?.length > 0 && selectedResults.length === results.results.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Research Results</h2>
          <Badge variant="outline" className="text-sm">
            {selectedResults.length} of {results.results?.length || 0} selected
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Query: &quot;{results.query}&quot;</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.results?.length > 0 ? (
            results.results.map((result, index) => (
              <div
                key={index}
                className="bg-card shadow-sm rounded-lg border overflow-hidden transition-all hover:shadow-md"
              >
                <div className="px-5 py-4 border-b">
                  <div className="flex items-start gap-3">
                    <SimpleCheckbox 
                      id={`select-${index}`}
                      checked={selectedResults.includes(result.url)}
                      onChange={() => toggleResultSelection(result.url)}
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <h3 className="text-lg leading-6 font-medium text-card-foreground line-clamp-1">
                          {result.title}
                        </h3>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary hover:text-primary/90 transition-colors whitespace-nowrap"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {formatUrl(result.url)}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {result.published_date && (
                          <p className="text-xs text-muted-foreground">
                            Published: {new Date(result.published_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground break-all hidden sm:block">
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono hover:text-primary hover:underline"
                          >
                            {result.url}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t">
                  <div className="px-5 py-4">
                    <div
                      className={`prose max-w-none text-foreground ${
                        !expandedResults.includes(result.url) ? 'line-clamp-3' : ''
                      }`}
                    >
                      {result.content}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(result.url)}
                      className="mt-3 flex items-center text-sm text-primary hover:text-primary/90 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md transition-colors"
                    >
                      {expandedResults.includes(result.url) ? (
                        <>
                          <ChevronUp className="mr-1 h-4 w-4" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-4 w-4" />
                          Show more
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-muted rounded-lg border">
              <p className="text-muted-foreground">No results found for this query.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            // Use router.push instead of window.history.back() for better Next.js integration
            router.push(`/topics/${topicId}`);
          }}
        >
          Back to Topics
        </Button>
        {results.results?.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <SimpleCheckbox 
                id="select-all"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span 
                className="text-sm cursor-pointer" 
                onClick={toggleSelectAll}
              >
                Select All
              </span>
            </div>
            <Button 
              onClick={handleGeneratePosts}
              disabled={selectedResults.length === 0}
            >
              <FileText className="mr-2" />
              Generate LinkedIn Posts ({selectedResults.length})
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResearchResults;