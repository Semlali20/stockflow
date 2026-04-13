// src/components/ui/GradientButton.tsx
import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  /** Alias for variant */
  gradient?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  glow?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  gradient,
  size = 'md',
  disabled,
  icon,
  loading = false,
  glow = false,
  ...props
}) => {
  const resolvedVariant = gradient ?? variant;

  const variants: Record<string, { bg: string; shadow: string }> = {
    primary:   {
      bg: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4338CA 100%)',
      shadow: glow
        ? '0 4px 12px rgba(79,70,229,0.35), 0 8px 28px rgba(79,70,229,0.25)'
        : '0 2px 8px rgba(79,70,229,0.25), 0 4px 16px rgba(79,70,229,0.18)',
    },
    secondary: {
      bg: 'linear-gradient(135deg, #6B6B94 0%, #4A4A6A 100%)',
      shadow: '0 2px 8px rgba(107,107,148,0.25)',
    },
    success:   {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      shadow: glow
        ? '0 4px 12px rgba(16,185,129,0.35), 0 8px 28px rgba(16,185,129,0.22)'
        : '0 2px 8px rgba(16,185,129,0.25)',
    },
    danger:    {
      bg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      shadow: glow
        ? '0 4px 12px rgba(244,63,94,0.35), 0 8px 28px rgba(244,63,94,0.22)'
        : '0 2px 8px rgba(244,63,94,0.25)',
    },
  };

  const sizes: Record<string, string> = {
    sm: 'py-1.5 px-4 text-sm gap-1.5',
    md: 'py-2.5 px-6 text-sm gap-2',
    lg: 'py-3 px-8 text-base gap-2',
  };

  const cfg = variants[resolvedVariant] ?? variants.primary;

  return (
    <button
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center
        text-white font-semibold rounded-xl
        ${sizes[size]}
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:scale-[1.01]
        active:translate-y-0 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      disabled={disabled || loading}
      style={{
        background: cfg.bg,
        boxShadow: cfg.shadow,
      }}
      {...props}
    >
      {/* Shimmer */}
      <span className="absolute inset-0 pointer-events-none [transform:skew(-13deg)_translateX(-100%)] hover:[transform:skew(-13deg)_translateX(100%)] transition-transform duration-700">
        <span className="block h-full w-8 bg-white/20" />
      </span>

      {loading ? (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
