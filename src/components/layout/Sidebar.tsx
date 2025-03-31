// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  List, 
  FileText, 
  Calendar,
  Settings,
  Clock 
} from 'lucide-react';

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
        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
    }`}
  >
    <span className={`mr-3 ${isActive ? 'text-primary-500' : 'text-gray-500'}`}>{icon}</span>
    {text}
  </Link>
);

const Sidebar = () => {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      text: 'Dashboard',
    },
    {
      href: '/topics',
      icon: <List className="h-5 w-5" />,
      text: 'Topics',
    },
    {
      href: '/posts/scheduled',
      icon: <Clock className="h-5 w-5" />,
      text: 'Scheduled Posts',
    },
    {
      href: '/posts',
      icon: <FileText className="h-5 w-5" />,
      text: 'Posts',
    },
    {
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
      text: 'Calendar',
    },
    {
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      text: 'Settings',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm transition-colors">
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