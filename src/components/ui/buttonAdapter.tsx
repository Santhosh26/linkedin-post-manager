//src\components\ui\buttonAdapter.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define our own ButtonProps type based on the buttonVariants
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'default',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    leftIcon,
    rightIcon,
    ariaLabel,
    ...props 
  }, ref) => {
    // Use cn utility for class merging instead of template literals
    const buttonClasses = cn(
      fullWidth && 'w-full',
      className
    );
    
    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 size-4 animate-spin" />
            {children}
          </span>
        ) : (
          <span className="flex items-center justify-center">
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </span>
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };