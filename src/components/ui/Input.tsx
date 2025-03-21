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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`px-3 py-2 bg-white border border-gray-300 
                      text-gray-900 rounded-md shadow-sm 
                      placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500
                      hover:border-gray-400
                      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}
                      ${fullWidth ? 'w-full' : ''}
                      transition-all
                      ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;