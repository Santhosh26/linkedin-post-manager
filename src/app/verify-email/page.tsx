// src/app/verify-email/page.tsx
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <p className="text-gray-700 mb-6">
                A sign in link has been sent to your email address.
                Please check your inbox (and spam folder) and click the link to sign in.
              </p>
              
              <p className="text-sm text-gray-500 mt-8">
                Didn't receive an email?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
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