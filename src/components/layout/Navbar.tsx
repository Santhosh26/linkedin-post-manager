// src/components/layout/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, User } from 'lucide-react';
import NotificationCenter from '@/components/ui/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Navbar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  return (
    <nav className="bg-card text-card-foreground border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-500">
                LinkedIn Post Manager
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/topics"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Topics
                  </Link>
                  <Link
                    href="/posts"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Posts
                  </Link>
                  <Link
                    href="/calendar"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Calendar
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/features"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Pricing
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            {/* Add Theme Toggle */}
            <ThemeToggle />
            
            {/* Add Notification Center */}
            {session && <NotificationCenter />}
            
            {session ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileDropdown}
                    className="bg-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    {session.user?.image ? (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt="User"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        <User />
                      </div>
                    )}
                  </button>
                </div>
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-black ring-opacity-5 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      {session.user?.name || session.user?.email}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile theme toggle */}
            <div className="mr-2">
              <ThemeToggle />
            </div>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-card">
          <div className="pt-2 pb-3 space-y-1">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Dashboard
                </Link>
                <Link
                  href="/topics"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Topics
                </Link>
                <Link
                  href="/posts"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Posts
                </Link>
                <Link
                  href="/calendar"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Calendar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Pricing
                </Link>
              </>
            )}
          </div>
          {session ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {session.user?.image ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt="User"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <User />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {session.user?.name || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;