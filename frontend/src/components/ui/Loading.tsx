import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent-teal rounded-full"
        />
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 rounded-full',
        sizes[size]
      )}
    />
  );
};

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('skeleton', className)} />
  );
};

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
