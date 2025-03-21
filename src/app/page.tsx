// src/app/page.tsx
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { FiSearch, FiEdit, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Streamline your</span>{' '}
                  <span className="block text-primary-500 xl:inline">LinkedIn content</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  From research to publication, manage your entire LinkedIn content workflow
                  in one place. Save time, improve engagement, and never run out of ideas.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-primary-500 hover:bg-primary-600 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="People working on laptops"
          />
        </div>
      </div>

      {/* Feature section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to create LinkedIn content
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform helps you create, manage, and schedule high-quality LinkedIn posts with less effort.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-[1rem] bg-primary-500 text-white">
                  <FiSearch className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI-Assisted Research</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Discover trending topics and relevant content with our AI-powered research tools.
                  Stay up-to-date with the latest developments in your industry.
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-[1rem] bg-primary-500 text-white">
                  <FiEdit className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Intelligent Post Generation</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Transform research into engaging LinkedIn posts with our AI content generator.
                  Create multiple variations to find the perfect tone for your audience.
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-[1rem] bg-primary-500 text-white">
                  <FiCheckCircle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Content Workspace</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Organize your content by topics or campaigns. Save, edit, and track posts
                  all in one unified workspace.
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-[1rem] bg-primary-500 text-white">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Scheduling Capabilities</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Schedule posts for optimal times and maintain a consistent presence on LinkedIn.
                  View your content calendar to plan your strategy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to boost your LinkedIn presence?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join thousands of professionals who are saving time and improving their LinkedIn engagement.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button 
                variant="secondary"
                size="lg"
                aria-label="Get started for free"
              >
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}