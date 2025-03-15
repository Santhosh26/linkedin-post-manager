// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-gray-300 dark:border-gray-700 
                    text-gray-900 dark:text-dark-text-primary rounded-md shadow-sm 
                    placeholder-gray-400 dark:placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-primary-500 dark:focus:border-primary-600
                    ${error ? 'border-red-500 dark:border-red-600' : ''}
                    ${fullWidth ? 'w-full' : ''}
                    transition-colors
                    ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;