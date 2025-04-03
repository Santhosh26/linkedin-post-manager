// src/app/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm';
import Navbar from '@/components/layout/Navbar';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-foreground">
            LinkedIn Post Manager
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 shadow rounded-lg sm:px-10 border">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  );
}