import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className={cn(
        'min-w-full',
        'divide-y divide-primary-100/60 dark:divide-neutral-800',
        className,
      )}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className }: TableProps) => {
  return (
    <thead className={cn(
      'bg-primary-50/70 dark:bg-neutral-900/70',
      className,
    )}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className }: TableProps) => {
  return (
    <tbody className={cn(
      'bg-white dark:bg-neutral-900/50',
      'divide-y divide-primary-100/40 dark:divide-neutral-800/60',
      className,
    )}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className }: TableProps) => {
  return (
    <tr className={cn(
      'transition-colors duration-150',
      'hover:bg-primary-50/50 dark:hover:bg-primary-900/10',
      className,
    )}>
      {children}
    </tr>
  );
};

export const TableHeader = ({ children, className }: TableProps) => {
  return (
    <th className={cn(
      'px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest',
      'text-primary-600 dark:text-primary-400',
      className,
    )}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className }: TableProps) => {
  return (
    <td className={cn(
      'px-6 py-4 text-sm font-medium',
      'text-neutral-800 dark:text-neutral-200',
      className,
    )}>
      {children}
    </td>
  );
};
