import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const colorClasses = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-teal',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary',
  delay = 0 
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-3d p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl shadow-3d-md',
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            trend.isPositive 
              ? 'bg-success/10 text-success' 
              : 'bg-danger/10 text-danger'
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {value}
        </h3>
      </div>
      <div className="mt-4 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className={cn('h-full rounded-full', colorClasses[color])}
        />
      </div>
    </motion.div>
  );
};

