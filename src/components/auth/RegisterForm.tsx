// src/components/auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from "@/hooks/use-toast";

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Updated to use consolidated auth endpoint with action parameter
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create account');
      }

      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now log in.",
      });
      

      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-md shadow-sm space-y-4">
          <Input
            id="name"
            type="text"
            label="Full Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Full Name"
            autoComplete="name"
          />

          <Input
            id="email"
            type="email"
            label="Email address"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Email address"
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Password"
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Confirm Password"
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="group relative"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </div>
  );
};

export default RegisterForm;