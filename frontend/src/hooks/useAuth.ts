import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, logout } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/services/api';
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES } from '@/config/constants';
import { storage } from '@/utils/storage';
import type { User } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const token = authService.getAccessToken();

    if (!storedUser || !token) {
      if (user) dispatch(logout());
      return;
    }

    // If we have a user but no permissions yet, fetch fresh data from /api/auth/me
    // so that the real backend permissions (including custom roles) are loaded.
    if (!storedUser.permissions || storedUser.permissions.length === 0) {
      apiClient
        .get<User>(API_ENDPOINTS.USERS.CURRENT_USER)
        .then(res => {
          const freshUser = res.data;
          storage.set(STORAGE_KEYS.USER, freshUser);
          dispatch(setUser(freshUser));
        })
        .catch(() => {
          // Token may be expired — use whatever is cached, interceptor will refresh
          dispatch(setUser(storedUser));
        });
    } else if (!user) {
      dispatch(setUser(storedUser));
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
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
