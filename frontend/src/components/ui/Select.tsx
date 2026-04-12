// src/components/ui/Select.tsx

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={[
            'w-full h-11 px-4 rounded-xl text-sm font-medium appearance-none',
            'bg-white dark:bg-neutral-800/60',
            'border-2',
            error
              ? 'border-danger text-danger-dark'
              : 'border-neutral-200 dark:border-neutral-700/60 text-neutral-900 dark:text-white',
            'outline-none transition-all duration-200 cursor-pointer',
            !error && 'focus:border-primary-500 dark:focus:border-primary-400 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.14)]',
            !error && 'hover:border-primary-300 dark:hover:border-primary-700',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
