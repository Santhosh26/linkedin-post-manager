// src/components/posts/PostForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiX, FiPlus, FiCalendar } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

interface Topic {
  id: string;
  name: string;
}

const postSchema = z.object({
  content: z.string().min(10, 'Post content must be at least 10 characters'),
  hashtags: z.array(z.string()).optional(),
  topicId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('DRAFT'),
  scheduledFor: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: {
    id?: string;
    content: string;
    hashtags: string[];
    topicId?: string;
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
    scheduledFor?: string;
  };
  isEditMode?: boolean;
}

const PostForm = ({ initialData, isEditMode = false }: PostFormProps) => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTopics, setIsFetchingTopics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hashtag, setHashtag] = useState('');

  // Initialize scheduledFor with current date/time if status is SCHEDULED
  const defaultScheduledFor = initialData?.scheduledFor 
    ? new Date(initialData.scheduledFor) 
    : new Date();
  
  defaultScheduledFor.setMinutes(defaultScheduledFor.getMinutes() + 30);
  
  const defaultScheduledForString = defaultScheduledFor.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialData?.content || '',
      hashtags: initialData?.hashtags || [],
      topicId: initialData?.topicId || '',
      status: initialData?.status || 'DRAFT',
      scheduledFor: initialData?.scheduledFor 
        ? new Date(initialData.scheduledFor).toISOString().slice(0, 16) 
        : defaultScheduledForString,
    },
  });

  const hashtags = watch('hashtags') || [];
  const status = watch('status');

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics. Please try again.');
      } finally {
        setIsFetchingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  const addHashtag = () => {
    let formattedTag = hashtag.trim();
    
    // Add # if it doesn't start with one
    if (formattedTag && !formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }
    
    if (formattedTag && !hashtags.includes(formattedTag)) {
      setValue('hashtags', [...hashtags, formattedTag]);
      setHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setValue(
      'hashtags',
      hashtags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: PostFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        // Only include scheduledFor if status is SCHEDULED
        scheduledFor: data.status === 'SCHEDULED' ? data.scheduledFor : undefined,
      };

      const response = await fetch(
        isEditMode ? `/api/posts/${initialData?.id}` : '/api/posts',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save post');
      }

      // Redirect to posts list
      router.push('/posts');
      router.refresh();
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err instanceof Error ? err.message : 'Failed to save post');
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title={isEditMode ? 'Edit Post' : 'Create New Post'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Post Content
              </label>
              <textarea
                id="content"
                rows={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Write your LinkedIn post content here..."
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtags
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a hashtag (e.g. #marketing)"
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                />
                <Button type="button" onClick={addHashtag}>
                  <FiPlus className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                      onClick={() => removeHashtag(tag)}
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="topicId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Topic (Optional)
              </label>
              <select
                id="topicId"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                {...register('topicId')}
                disabled={isFetchingTopics}
              >
                <option value="">Select a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              {isFetchingTopics && (
                <p className="mt-1 text-sm text-gray-500">Loading topics...</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                {...register('status')}
              >
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {status === 'SCHEDULED' && (
              <div>
                <label
                  htmlFor="scheduledFor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Schedule Date and Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="scheduledFor"
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register('scheduledFor')}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Post' : 'Create Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm;