// src/app/verify-email/page.tsx
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Check your email
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
            <div className="text-center">
              <p className="text-card-foreground mb-6">
                A sign in link has been sent to your email address.
                Please check your inbox (and spam folder) and click the link to sign in.
              </p>
              
              <p className="text-sm text-muted-foreground mt-8">
                Didn&apos;t receive an email?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 underline underline-offset-4">
                  Try again
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}