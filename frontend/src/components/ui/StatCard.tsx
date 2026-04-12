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

const colorConfig = {
  primary: {
    icon: 'bg-gradient-to-br from-primary-400 to-primary-600',
    bar: 'from-primary-400 to-primary-600',
    glow: 'rgba(79, 70, 229, 0.3)',
    trendBg: 'bg-primary-50 dark:bg-primary-900/20',
    trendText: 'text-primary-600 dark:text-primary-400',
    iconShadow: '0 4px 12px rgba(79, 70, 229, 0.40)',
  },
  accent: {
    icon: 'bg-gradient-to-br from-accent-teal to-accent-teal-dark',
    bar: 'from-accent-teal to-accent-teal-dark',
    glow: 'rgba(6, 182, 212, 0.3)',
    trendBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    trendText: 'text-cyan-600 dark:text-cyan-400',
    iconShadow: '0 4px 12px rgba(6, 182, 212, 0.40)',
  },
  success: {
    icon: 'bg-gradient-to-br from-success-light to-success-dark',
    bar: 'from-success-light to-success-dark',
    glow: 'rgba(16, 185, 129, 0.3)',
    trendBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    trendText: 'text-emerald-600 dark:text-emerald-400',
    iconShadow: '0 4px 12px rgba(16, 185, 129, 0.40)',
  },
  warning: {
    icon: 'bg-gradient-to-br from-warning-light to-warning-dark',
    bar: 'from-warning-light to-warning-dark',
    glow: 'rgba(245, 158, 11, 0.3)',
    trendBg: 'bg-amber-50 dark:bg-amber-900/20',
    trendText: 'text-amber-600 dark:text-amber-400',
    iconShadow: '0 4px 12px rgba(245, 158, 11, 0.40)',
  },
  danger: {
    icon: 'bg-gradient-to-br from-danger-light to-danger-dark',
    bar: 'from-danger-light to-danger-dark',
    glow: 'rgba(244, 63, 94, 0.3)',
    trendBg: 'bg-rose-50 dark:bg-rose-900/20',
    trendText: 'text-rose-600 dark:text-rose-400',
    iconShadow: '0 4px 12px rgba(244, 63, 94, 0.40)',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  delay = 0,
}: StatCardProps) => {
  const cfg = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, type: 'spring', stiffness: 120, damping: 14 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card-3d p-6 cursor-pointer group relative overflow-hidden"
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${cfg.glow} 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'p-3 rounded-xl shrink-0',
              cfg.icon,
            )}
            style={{ boxShadow: cfg.iconShadow }}
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={2} />
          </motion.div>

          {/* Trend badge */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold',
                trend.isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
              )}
            >
              <span className="text-[10px]">{trend.isPositive ? '▲' : '▼'}</span>
              {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>

        {/* Title */}
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5">
          {title}
        </p>

        {/* Value */}
        <h3
          className="text-3xl font-bold text-neutral-900 dark:text-white leading-none"
          style={{
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </h3>

        {/* Progress bar */}
        <div className="mt-5 h-1 bg-neutral-100 dark:bg-neutral-700/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '72%' }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn('h-full rounded-full bg-gradient-to-r', cfg.bar)}
          />
        </div>
      </div>
    </motion.div>
  );
};
