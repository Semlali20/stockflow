// src/components/ui/Card.tsx

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  action?: ReactNode;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantStyles = {
  default:  'bg-white dark:bg-neutral-900/80 shadow-[0_1px_2px_rgba(79,70,229,0.04),0_4px_12px_rgba(79,70,229,0.07)] border border-primary-100/60 dark:border-neutral-800',
  glass:    'bg-white/88 dark:bg-neutral-900/70 backdrop-blur-xl shadow-[0_4px_16px_rgba(79,70,229,0.09)] border border-primary-100/60 dark:border-neutral-700/50',
  bordered: 'bg-white dark:bg-neutral-900/80 border-2 border-primary-100 dark:border-neutral-700',
  elevated: 'bg-white dark:bg-neutral-900/80 shadow-[0_4px_8px_rgba(79,70,229,0.08),0_12px_28px_rgba(79,70,229,0.10)] border border-primary-100/60 dark:border-neutral-800',
};

export const Card = ({
  children,
  className = '',
  padding,
  title,
  subtitle,
  variant,
  action,
  ...rest
}: CardProps) => {
  const resolvedPadding = padding ?? ((title || variant) ? 'md' : 'none');
  const resolvedVariant = variant ?? 'default';

  return (
    <div className={cn(
      'rounded-2xl transition-all duration-300',
      variantStyles[resolvedVariant],
      paddingStyles[resolvedPadding],
      className,
    )}
    {...rest}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3
                className="text-base font-bold text-neutral-900 dark:text-white"
                style={{ fontFamily: 'Syne, system-ui, sans-serif', letterSpacing: '-0.02em' }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{subtitle}</p>
            )}
          </div>
          {action && <div className="ml-4 shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
