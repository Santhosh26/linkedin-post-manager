// src/app/login/page.tsx
'use client';

import { useSearchParams } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/layout/Navbar';

export default function LoginPage() {
  const searchParams = useSearchParams();

  const { toast } = useToast();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Get callbackUrl or default to /dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    // Handle 'registered' message
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setMessage({ type: 'success', text: 'Account created. Please log in.' });
      // Clean URL: Remove the 'registered' param after showing the message
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('registered');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Handle 'error' message
    const error = searchParams.get('error');
    if (error) {
        let errorText = 'An authentication error occurred.';
        // Add specific error messages based on NextAuth error codes
        if (error === 'CredentialsSignin') {
            errorText = 'Invalid email or password.';
        } else if (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount') {
            errorText = 'Error during sign in with LinkedIn. Please try again.';
        } else if (error === 'OAuthAccountNotLinked') {
            errorText = 'This email is already linked to another account. Try signing in with a different method.';
        }
        // Add more specific error mappings if needed

        setMessage({ type: 'error', text: errorText });
        // Clean URL: Remove the 'error' param after showing the message
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]); // Depend only on searchParams

  // Define the success handler to pass to LoginForm
  // Uses window.location.href for full page reload
  const handleLoginSuccess = () => {
    toast({
      title: "Login Successful",
      description: "Redirecting...",
    });
    // Use window.location.href for a full page reload to ensure state synchronization
    window.location.href = callbackUrl;
    // No need for router.push() or router.refresh()
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          LinkedIn Post Manager
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-4">
            {/* Dynamically render icon based on message type */}
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        {/* Pass the success handler to the LoginForm component */}
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
    </>
  );
}