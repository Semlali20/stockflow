import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    toggleTheme();
    toast.success(theme === 'light' ? 'Dark mode activated' : 'Light mode activated', {
      icon: theme === 'light' ? '🌙' : '☀️',
      duration: 2000,
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 180 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="p-3 rounded-xl bg-white/10 dark:bg-neutral-800/50 backdrop-blur-lg border border-white/20 dark:border-neutral-700 hover:bg-white/20 dark:hover:bg-neutral-700/50 transition-colors shadow-lg"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-neutral-700" />
      )}
    </motion.button>
  );
};