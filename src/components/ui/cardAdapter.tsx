// src\components\ui\cardAdapter.tsx
'use client';

import * as React from 'react';
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <ShadcnCard className={className}>
      {children}
    </ShadcnCard>
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
    <ShadcnCardHeader className={className}>
      <div className="flex justify-between items-center">
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </ShadcnCardHeader>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <ShadcnCardContent className={className}>{children}</ShadcnCardContent>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <ShadcnCardFooter className={className}>
      {children}
    </ShadcnCardFooter>
  );
};