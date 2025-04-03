// src\components\posts\ImageSelector.tsx
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { UnsplashImage } from '@/lib/services/unsplash';
import { Button } from '@/components/ui/buttonAdapter';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';

interface ImageSelectorProps {
  onImageSelect: (image: UnsplashImage | null) => void;
  selectedImage?: UnsplashImage | null;
}

export default function ImageSelector({ onImageSelect, selectedImage }: ImageSelectorProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Search for images based on query
  const searchImages = async () => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/images?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError('Error searching for images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle image selection
  const handleSelectImage = (image: UnsplashImage) => {
    onImageSelect(image);
    setShowSelector(false);
  };
  
  // Clear selected image - ensure we explicitly pass null
  const clearSelectedImage = () => {
    console.log('Clearing selected image, setting to null');
    onImageSelect(null);
  };
  
  return (
    <div className="mt-4">
      {selectedImage ? (
        <div className="relative">
          <div className="relative w-full h-48">
            <Image 
              src={selectedImage.urls?.small || selectedImage.urls.thumb} 
              alt={selectedImage.alt_description || 'Selected image'} 
              className="rounded-lg object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="absolute bottom-2 right-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={clearSelectedImage}
              aria-label="Remove image"
            >
              <X className="mr-1" /> Remove
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Photo by <a 
              href={`https://unsplash.com/@${selectedImage.user?.username || 'unsplash'}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              {selectedImage.user?.name || 'Unsplash'}
            </a> on Unsplash
          </p>
        </div>
      ) : (
        <div>
          {showSelector ? (
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex mb-4">
                <Input
                  type="text"
                  placeholder="Search for images..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchImages();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    searchImages();
                  }}
                  type="button"
                  className="ml-2"
                >
                  <Search className="mr-1" /> Search
                </Button>
              </div>
              
              {error && (
                <p className="text-destructive mb-4">{error}</p>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {images.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">
                      {query ? 'No images found. Try a different search term.' : 'Search for images to add to your post.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2">
                      {images.map((image) => (
                        <div 
                          key={image.id}
                          onClick={() => handleSelectImage(image)}
                          className="cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-all hover:shadow-md"
                        >
                          <div className="relative w-full h-24">
                            <Image 
                              src={image.urls.thumb} 
                              alt={image.alt_description || 'Unsplash image'} 
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="secondary"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="secondary"
              onClick={() => setShowSelector(true)}
            >
              <ImageIcon className="mr-2" /> Add Image
            </Button>
          )}
        </div>
      )}
    </div>
  );
}