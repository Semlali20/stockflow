// src/components/ui/Spinner.tsx

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'accent' | 'blue' | 'gray';
}

export const Spinner = ({ size = 'md', color = 'primary' }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses: Record<string, string> = {
    primary: 'border-primary-200 dark:border-primary-800 border-b-primary-500',
    white:   'border-white/30 border-b-white',
    accent:  'border-cyan-200 dark:border-cyan-800 border-b-accent-teal',
    blue:    'border-primary-200 dark:border-primary-800 border-b-primary-500',
    gray:    'border-neutral-200 dark:border-neutral-700 border-b-neutral-500',
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color] ?? colorClasses.primary}`}
    />
  );
};
