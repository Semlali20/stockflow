import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, logout } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/config/constants';

export const useAuth = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Sync with localStorage on mount
    const storedUser = authService.getCurrentUser();
    if (storedUser && !user) {
      dispatch(setUser(storedUser));
    } else if (!storedUser && user) {
      dispatch(logout());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    } catch (error) {
      // Even if API call fails, clear local state
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    }
  };

  return {
    user,
    isAuthenticated,
    logout: handleLogout,
  };
};

