// src/components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button"; // Corrected import path
import { Input } from "@/components/ui/Input";   // Corrected import path
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { login } from '@/lib/authActions'; // Assuming you use this server action

// Schema definition remains the same
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Define props for the component
interface LoginFormProps {
  onLoginSuccess?: () => void; // Callback on successful login
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Correctly initialize useForm
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (!result.success) {
        const errorMessage = result.error || 'Invalid email or password';
        setError(errorMessage);
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call the success handler passed via props
      if (onLoginSuccess) {
        onLoginSuccess();
        // Keep isLoading true as navigation is happening
      } else {
        console.warn("LoginForm: onLoginSuccess prop not provided.");
        window.location.href = '/dashboard'; // Fallback
      }

    } catch (err) {
      console.error('Login submit error:', err);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      {/* Fill in CardHeader */}
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-extrabold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Or{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
            create a new account
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fill in FormFields */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input placeholder="Email address" className="pl-10" {...field} />
                    </div>
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input type="password" placeholder="Password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="grid gap-1.5 leading-none"> {/* Use grid for better label alignment */}
                      <label
                        htmlFor="remember-me"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  </FormItem>
                )}
              />

              {/* Fill in Forgot Password link */}
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;