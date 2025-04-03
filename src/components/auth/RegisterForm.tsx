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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
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
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Create your account
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          Or{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 underline underline-offset-4">
            sign in to your existing account
          </Link>
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full Name" 
                      autoComplete="name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      autoComplete="new-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm Password" 
                      autoComplete="new-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;