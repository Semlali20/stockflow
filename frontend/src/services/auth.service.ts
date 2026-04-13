import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/constants';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  User,
  TokenResponse,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  PasswordChangeRequest,
} from '@/types';
import { storage } from '@/utils/storage';

// Remember Me key - should match LoginPage
const REMEMBER_ME_KEY = 'remember_me_credentials';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Store tokens and user
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
    storage.set(STORAGE_KEYS.USER, response.data.user);
    localStorage.setItem('user', JSON.stringify(response.data.user)); // ← Important!


    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          headers: {
            Authorization: `Bearer ${storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN)}`,
          },
        }
      );
      
      // Clear all storage including Remember Me if needed
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      
      // Note: We DON'T clear REMEMBER_ME_KEY on logout
      // This allows users to keep their username remembered even after logout
      // Only clear it if you want to forget the username on logout:
      // localStorage.removeItem(REMEMBER_ME_KEY);
      
      return response.data;
    } catch (error) {
      // Clear storage even if API call fails
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken } as RefreshTokenRequest
    );
    
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
    
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email } as PasswordResetRequest
    );
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword } as PasswordResetConfirmRequest
    );
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword } as PasswordChangeRequest
    );
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.get<ApiResponse<void>>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { params: { token } }
    );
    return response.data;
  },
  
  resendVerificationEmail: async (email: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/api/auth/resend-verification',
      { email }
    );
    return response.data;
  },
  
  getCurrentUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  getAccessToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  isAuthenticated: (): boolean => {
    return !!storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // Helper method to clear Remember Me if needed
  clearRememberMe: (): void => {
    localStorage.removeItem(REMEMBER_ME_KEY);
  },
};