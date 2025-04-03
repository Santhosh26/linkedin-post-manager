// src/components/topics/TopicForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/buttonAdapter';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

const topicSchema = z.object({
  name: z.string().min(2, 'Topic name must be at least 2 characters'),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
});

type TopicFormValues = {
  name: string;
  keywords: string[];
};

interface TopicFormProps {
  initialData?: {
    id?: string;
    name: string;
    keywords: string[];
  };
  isEditMode?: boolean;
}

const TopicForm = ({ initialData, isEditMode = false }: TopicFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: initialData?.name || '',
      keywords: initialData?.keywords || [],
    },
  });

  const keywords = watch('keywords');

  const addKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      setValue('keywords', [...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setValue(
      'keywords',
      keywords.filter((k) => k !== keywordToRemove)
    );
  };

  const onSubmit = async (data: TopicFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        isEditMode ? `/api/topics/${initialData?.id}` : '/api/topics/all',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save topic');
      }

      toast({
        title: isEditMode ? "Topic Updated" : "Topic Created",
        description: isEditMode 
          ? "Your topic has been updated successfully." 
          : "Your topic has been created successfully.",
      });

      // Redirect to topics list or topic detail
      router.push(isEditMode ? `/topics/${initialData?.id}` : '/topics');
      router.refresh();
    } catch (err) {
      console.error('Error saving topic:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save topic';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader title={isEditMode ? 'Edit Topic' : 'Create New Topic'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-4 bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Method 1: Use the register props separately */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Topic Name
              </label>
              <Input
                id="name"
                placeholder="E.g., Digital Marketing, Leadership, Web Development"
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name?.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Keywords
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Add a keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addKeyword}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              {errors.keywords && (
                <p className="mt-1 text-sm text-destructive">{errors.keywords.message}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {keywords.map((kw, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                  >
                    {kw}
                    <button
                      type="button"
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary/70 hover:bg-primary/20 hover:text-primary focus:outline-none"
                      onClick={() => removeKeyword(kw)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Topic' : 'Create Topic'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TopicForm;