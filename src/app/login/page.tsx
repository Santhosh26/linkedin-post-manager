// src/app/login/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for redirect params
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setMessage({
        type: 'success',
        text: 'Your account has been created successfully. Please log in.',
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          LinkedIn Post Manager
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {message && (
          <Alert 
            variant={message.type === 'success' ? 'default' : 'destructive'}
            className="mb-4"
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        
        {/* LoginForm is already a Card component now, so we don't need to wrap it */}
        <LoginForm />
      </div>
    </div>
  );
}