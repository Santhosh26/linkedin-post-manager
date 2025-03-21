// src/components/settings/SecuritySection.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiLock, FiShield, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Updated to use consolidated auth endpoint with action parameter
      const response = await fetch('/api/auth?action=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      reset();
      // Close modal after successful update
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Security Settings" />
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FiLock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">Password</h3>
                    <Button
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
                    Update your password regularly to keep your account secure
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <FiShield className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-dark-text-primary">Account Activity</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                    >
                      View Activity
                    </Button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">
                    Monitor recent login activity and security events
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="change-password-modal" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-dark-bg-secondary rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-dark-bg-secondary rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                  <FiLock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-text-primary" id="modal-title">
                    Change Password
                  </h3>
                  <div className="mt-4 w-full">
                    {error && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                        <div className="flex">
                          <FiAlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                          <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 p-4 rounded">
                        <div className="flex">
                          <FiCheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                          <div className="ml-3">
                            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <Input
                        id="currentPassword"
                        type="password"
                        label="Current Password"
                        {...register('currentPassword')}
                        error={errors.currentPassword?.message}
                        placeholder="Enter your current password"
                      />

                      <Input
                        id="newPassword"
                        type="password"
                        label="New Password"
                        {...register('newPassword')}
                        error={errors.newPassword?.message}
                        placeholder="Enter your new password"
                        helperText="Password must be at least 8 characters"
                      />

                      <Input
                        id="confirmPassword"
                        type="password"
                        label="Confirm New Password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        placeholder="Confirm your new password"
                      />

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full sm:ml-3 sm:w-auto"
                        >
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsModalOpen(false)}
                          className="mt-3 w-full sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}