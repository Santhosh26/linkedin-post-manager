// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiList, 
  FiFileText, 
  FiCalendar,
  FiSettings,
  FiClock 
} from 'react-icons/fi';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, text, isActive }) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 dark:bg-dark-bg-tertiary dark:text-primary-400'
        : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {text}
  </Link>
);

const Sidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: '/dashboard',
      icon: <FiHome className="h-5 w-5" />,
      text: 'Dashboard',
    },
    {
      href: '/topics',
      icon: <FiList className="h-5 w-5" />,
      text: 'Topics',
    },
    {
      href: '/posts/scheduled',
      icon: <FiClock className="h-5 w-5" />,
      text: 'Scheduled Posts',
    },
    {
      href: '/posts',
      icon: <FiFileText className="h-5 w-5" />,
      text: 'Posts',
    },
    {
      href: '/calendar',
      icon: <FiCalendar className="h-5 w-5" />,
      text: 'Calendar',
    },
    {
      href: '/settings',
      icon: <FiSettings className="h-5 w-5" />,
      text: 'Settings',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg-secondary border-r border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="px-4 space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              text={item.text}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;