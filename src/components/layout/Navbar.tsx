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
    <nav className="bg-card text-card-foreground border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                LinkedIn Post Manager
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {session ? (
                <>
                  {/* Add authenticated nav items if needed */}
                </>
              ) : (
                <>
                  <Link
                    href="/features"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Features
                  </Link>
                  <Link
                    href="/pricing"
                    className="border-transparent text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
                    className="bg-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <User />
                      </div>
                    )}
                  </button>
                </div>
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-border z-10">
                    <div className="px-4 py-2 text-sm text-foreground border-b border-border">
                      {session.user?.name || session.user?.email}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-muted"
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
                  className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/topics"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Topics
                </Link>
                <Link
                  href="/posts"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Posts
                </Link>
                <Link
                  href="/calendar"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Calendar
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-foreground hover:bg-muted hover:border-primary hover:text-primary"
                >
                  Pricing
                </Link>
              </>
            )}
          </div>
          {session ? (
            <div className="pt-4 pb-3 border-t border-border">
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
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <User />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">
                    {session.user?.name || 'User'}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-border">
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-primary hover:text-primary/90 hover:bg-muted"
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