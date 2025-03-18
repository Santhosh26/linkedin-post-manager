// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm dark:shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-800 transition-colors ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          {title && <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-tertiary">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`px-6 py-4 text-gray-700 dark:text-dark-text-secondary transition-colors ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg-tertiary transition-colors ${className}`}>
      {children}
    </div>
  );
};