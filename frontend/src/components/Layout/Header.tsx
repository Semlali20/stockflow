import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import {
  Bell,
  Menu,
  Package,
  Sparkles,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';
import { NotificationDropdown, useUnreadAlertCount } from '@/components/NotificationDropdown';
import { useTranslation } from 'react-i18next';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

interface HeaderProps {
  onMenuClick?: () => void;
}

const THEME_LABELS = {
  light: 'Neumorphism',
  dark: 'Dark Mode',
};
const THEME_NEXT: Record<string, string> = {
  light: 'dark',
  dark: 'light',
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Get unread alert count from the custom hook
  const unreadCount = useUnreadAlertCount();

  // Load profile image from user object or localStorage
  useEffect(() => {
    if (user?.id) {
      if (user.profileImageUrl) {
        setProfileImage(user.profileImageUrl);
      } else {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (savedImage) setProfileImage(savedImage);
      }
    }
  }, [user?.id, user?.profileImageUrl]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN);
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    const next = THEME_NEXT[theme];
    toast.success(`${THEME_LABELS[next as keyof typeof THEME_LABELS]} activated`, { duration: 1800 });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: 'spring' }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50 z-50 shadow-lg"
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          </motion.button>

          {/* Logo & Brand */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-purple-500 to-accent-teal flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-accent-teal bg-clip-text text-transparent">
                StockFlow
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1">Management System</p>
            </div>
          </motion.div>

        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-3">

          {/* Theme Toggle — cycles light ↔ dark */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleTheme}
            title={`Switch to ${THEME_LABELS[THEME_NEXT[theme] as keyof typeof THEME_LABELS]}`}
            className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative group"
          >
            {theme === 'light' && <Moon className="w-5 h-5 text-neutral-600" />}
            {theme === 'dark' && <Sparkles className="w-5 h-5 text-indigo-400" />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold bg-neutral-900 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              → {THEME_LABELS[THEME_NEXT[theme] as keyof typeof THEME_LABELS]}
            </span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowNotifications(!showNotifications);
              }}
              className="relative p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown - Using our new component */}
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          {/* New Profile Dropdown */}
          <ProfileDropdown
            user={{
              firstName: user?.firstName,
              lastName: user?.lastName,
              username: user?.username,
              email: user?.email,
              profileImageUrl: profileImage || undefined,
              roles: user?.roles as string[],
            }}
            onLogout={handleLogout}
            onProfileClick={() => navigate(ROUTES.PROFILE)}
            onSettingsClick={() => navigate(ROUTES.SETTINGS)}
            translations={{
              profile: t('layout.myProfile'),
              settings: t('layout.settings'),
              logout: t('layout.logout'),
            }}
          />
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setShowNotifications(false);
          }}
        />
      )}
    </motion.header>
  );
};