//src\components\ui\buttonAdapter.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

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
    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>{children}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </div>
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };