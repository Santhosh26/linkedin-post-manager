// src/components/posts/ImageSuggestions.tsx
import { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { UnsplashImage } from '@/lib/services/unsplash';
import Button from '@/components/ui/Button';

interface ImageSuggestionsProps {
  content: string;
  onSelectImage: (image: UnsplashImage) => void;
}

export default function ImageSuggestions({ content, onSelectImage }: ImageSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract keywords from content for image search
  const extractKeywords = (text: string): string => {
    // Simple extraction - remove common words and punctuation
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['and', 'the', 'that', 'this', 'with', 'from', 'have', 'your'].includes(word)
      );
    
    // Return top 3 words, or fewer if not enough
    return words.slice(0, 3).join(' ');
  };
  
  // Fetch suggested images based on content
  const fetchSuggestions = async () => {
    if (!content.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const keywords = extractKeywords(content);
      
      if (!keywords) {
        setError('Could not extract keywords from your content');
        return;
      }
      
      const response = await fetch(`/api/images?query=${encodeURIComponent(keywords)}&random=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch image suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError('Error finding image suggestions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch suggestions when content changes
  useEffect(() => {
    if (content.length > 30) {
      fetchSuggestions();
    }
  }, [content]);
  
  if (suggestions.length === 0 && !loading) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Images</h4>
      
      {error && (
        <p className="text-sm text-red-500 mb-2">{error}</p>
      )}
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {suggestions.map((image) => (
              <div 
                key={image.id}
                onClick={() => onSelectImage(image)}
                className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md"
              >
                <img 
                  src={image.urls.thumb} 
                  alt={image.alt_description || 'Suggested image'} 
                  className="w-full h-20 object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex justify-end">
            <Button 
              variant="secondary"
              size="sm"
              onClick={fetchSuggestions}
            >
              <FiRefreshCw className="mr-1 h-3 w-3" /> Refresh Suggestions
            </Button>
          </div>
        </>
      )}
    </div>
  );
}