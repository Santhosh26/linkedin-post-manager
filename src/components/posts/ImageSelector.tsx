import { useState } from 'react';
import { FiSearch, FiX, FiImage } from 'react-icons/fi';
import { UnsplashImage } from '@/lib/services/unsplash';
import Button from '@/components/ui/Button';

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
  
  // Clear selected image
  const clearSelectedImage = () => {
    onImageSelect(null);
  };
  
  return (
    <div className="mt-4">
      {selectedImage ? (
        <div className="relative">
            <img 
            src={selectedImage.urls?.small || selectedImage.thumb || selectedImage.url} 
            alt={selectedImage.alt_description || selectedImage.alt || 'Selected image'} 
            className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute bottom-2 right-2">
            <Button
                size="sm"
                variant="danger"
                onClick={clearSelectedImage}
                aria-label="Remove image"
            >
                <FiX className="mr-1" /> Remove
            </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
            Photo by <a 
                href={`https://unsplash.com/@${selectedImage.user?.username || 'unsplash'}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500"
            >
                {selectedImage.user?.name || selectedImage.credit?.name || 'Unsplash'}
            </a> on Unsplash
            </p>
        </div>
        ) : (
        <div>
          {showSelector ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex mb-4">
                <input
                  type="text"
                  placeholder="Search for images..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  onClick={searchImages}
                  className="ml-2"
                >
                  <FiSearch className="mr-1" /> Search
                </Button>
              </div>
              
              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {images.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">
                      {query ? 'No images found. Try a different search term.' : 'Search for images to add to your post.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2">
                      {images.map((image) => (
                        <div 
                          key={image.id}
                          onClick={() => handleSelectImage(image)}
                          className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md"
                        >
                          <img 
                            src={image.urls.thumb} 
                            alt={image.alt_description || 'Unsplash image'} 
                            className="w-full h-24 object-cover"
                          />
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
              <FiImage className="mr-2" /> Add Image
            </Button>
          )}
        </div>
      )}
    </div>
  );
}