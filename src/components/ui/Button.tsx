// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  className = '',
}) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary transition-colors';
  
  // Updated styles to match the link components from the home page
  const variantStyles = {
    // Primary button (matches "Get Started" link)
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500',
    
    // Secondary button (matches "Log In" link)
    secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-400 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 dark:focus:ring-blue-500',
    
    // Outline button (improved contrast version of secondary)
    outline: 'bg-transparent border border-blue-600 text-blue-700 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:focus:ring-blue-500',
    
    // Danger button (kept with red tone but made to match style of primary)
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;