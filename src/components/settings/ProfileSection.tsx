// src/components/settings/ProfileSection.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSection() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Make API request to update user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
          email: data.email,
        },
      });

      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Profile Information" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
              <div className="flex">
                <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <FiUser className="h-12 w-12" />
                  </div>
                )}
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full shadow-sm"
                >
                  Change
                </Button>
              </div>
            </div>

            <Input
              id="name"
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Your full name"
            />

            <Input
              id="email"
              type="email"
              label="Email Address"
              {...register('email')}
              error={errors.email?.message}
              placeholder="your@email.com"
              helperText="This email is used for login and notifications"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button
            type="submit"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}