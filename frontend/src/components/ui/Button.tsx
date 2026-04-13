// src/components/ui/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'accent' | 'ghost' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: [
    'relative overflow-hidden text-white',
    'bg-gradient-to-br from-primary-500 via-primary-500 to-primary-600',
    'shadow-[0_2px_4px_rgba(79,70,229,0.18),0_6px_16px_rgba(79,70,229,0.22),inset_0_1px_0_rgba(255,255,255,0.18)]',
    'hover:shadow-[0_4px_8px_rgba(79,70,229,0.28),0_12px_28px_rgba(79,70,229,0.32),inset_0_1px_0_rgba(255,255,255,0.22)]',
    'hover:-translate-y-0.5 hover:scale-[1.01]',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-primary-300 focus:ring-offset-1',
  ].join(' '),

  secondary: [
    'bg-neutral-100 dark:bg-neutral-800/80',
    'text-neutral-800 dark:text-neutral-200',
    'border border-neutral-200 dark:border-neutral-700/80',
    'hover:bg-neutral-200 dark:hover:bg-neutral-700',
    'hover:-translate-y-0.5',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-neutral-300',
  ].join(' '),

  danger: [
    'relative overflow-hidden text-white',
    'bg-gradient-to-br from-danger via-danger to-danger-dark',
    'shadow-[0_2px_4px_rgba(244,63,94,0.18),0_6px_16px_rgba(244,63,94,0.20)]',
    'hover:shadow-[0_4px_8px_rgba(244,63,94,0.28),0_12px_28px_rgba(244,63,94,0.28)]',
    'hover:-translate-y-0.5 hover:scale-[1.01]',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-red-300',
  ].join(' '),

  success: [
    'relative overflow-hidden text-white',
    'bg-gradient-to-br from-success via-success to-success-dark',
    'shadow-[0_2px_4px_rgba(16,185,129,0.18),0_6px_16px_rgba(16,185,129,0.20)]',
    'hover:shadow-[0_4px_8px_rgba(16,185,129,0.28),0_12px_28px_rgba(16,185,129,0.28)]',
    'hover:-translate-y-0.5 hover:scale-[1.01]',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-green-300',
  ].join(' '),

  accent: [
    'relative overflow-hidden text-white',
    'bg-gradient-to-br from-accent-teal via-accent-teal to-accent-teal-dark',
    'shadow-[0_2px_4px_rgba(6,182,212,0.18),0_6px_16px_rgba(6,182,212,0.22)]',
    'hover:shadow-[0_4px_8px_rgba(6,182,212,0.28),0_12px_28px_rgba(6,182,212,0.30)]',
    'hover:-translate-y-0.5 hover:scale-[1.01]',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-cyan-300',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'text-neutral-700 dark:text-neutral-300',
    'hover:bg-primary-50 dark:hover:bg-neutral-800',
    'hover:text-primary-600 dark:hover:text-primary-400',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
    'focus:ring-2 focus:ring-neutral-200',
  ].join(' '),

  warning: [
    'relative overflow-hidden text-white',
    'bg-gradient-to-br from-warning via-warning to-warning-dark',
    'shadow-[0_2px_4px_rgba(245,158,11,0.18),0_6px_16px_rgba(245,158,11,0.20)]',
    'hover:shadow-[0_4px_8px_rgba(245,158,11,0.28),0_12px_28px_rgba(245,158,11,0.28)]',
    'hover:-translate-y-0.5 hover:scale-[1.01]',
    'active:translate-y-0 active:scale-[0.98]',
    'focus:ring-2 focus:ring-amber-300',
  ].join(' '),

  outline: [
    'bg-transparent',
    'border border-primary-200 dark:border-primary-700/50',
    'text-primary-600 dark:text-primary-400',
    'hover:bg-primary-50 dark:hover:bg-primary-900/20',
    'hover:border-primary-400 dark:hover:border-primary-500',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
    'focus:ring-2 focus:ring-primary-200',
  ].join(' '),
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  icon,
  iconRight,
  loading,
  fullWidth,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-200 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantStyles[variant] ?? variantStyles.primary,
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer layer for primary/danger/success/accent/warning */}
      {(variant === 'primary' || variant === 'danger' || variant === 'success' || variant === 'accent' || variant === 'warning') && (
        <span
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerMove 2s ease-in-out infinite',
          }}
        />
      )}

      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};
