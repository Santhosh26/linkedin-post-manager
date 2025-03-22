// src/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
}

const Button = ({ 
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  leftIcon,
  rightIcon,
  ariaLabel
}: ButtonProps) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-all duration-300';
  
  // Gradient backgrounds that shift on hover
  const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white border border-transparent shadow hover:shadow-md active:shadow active:translate-y-0.5 focus:ring-2 focus:ring-violet-300 focus:ring-offset-2',
    
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border border-gray-300 shadow hover:shadow-md active:shadow active:translate-y-0.5 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border border-transparent shadow hover:shadow-md active:shadow active:translate-y-0.5 focus:ring-2 focus:ring-green-300 focus:ring-offset-2',
    
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-transparent shadow hover:shadow-md active:shadow active:translate-y-0.5 focus:ring-2 focus:ring-red-300 focus:ring-offset-2',
  };
  
  // Responsive sizing
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };
  
  // Icon sizing based on button size
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className={`animate-spin mr-2 ${iconSizes[size]}`} />
          <span>{children}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </div>
      )}
    </button>
  );
};

export default Button;