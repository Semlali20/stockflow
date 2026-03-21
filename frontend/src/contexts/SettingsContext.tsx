// frontend/src/contexts/SettingsContext.tsx
// Global settings context – loads from localStorage and applies ALL live effects

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeneralSettings {
  // Appearance
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  showAvatars: boolean;
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  lowStockAlerts: boolean;
  movementAlerts: boolean;
  qualityAlerts: boolean;
  systemAlerts: boolean;
  alertFrequency: 'realtime' | 'hourly' | 'daily';
  // Localization
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  numberFormat: 'comma' | 'dot';
  // Security
  sessionTimeout: number;  // minutes; 0 = never
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  // Data & Display
  defaultPageSize: number;
  autoRefreshInterval: number;  // seconds; 0 = disabled
}

export interface SettingsContextType {
  settings: GeneralSettings;
  updateSettings: (partial: Partial<GeneralSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  isDark: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: GeneralSettings = {
  theme: 'light',
  sidebarCollapsed: false,
  showAvatars: true,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: false,
  lowStockAlerts: true,
  movementAlerts: true,
  qualityAlerts: true,
  systemAlerts: true,
  alertFrequency: 'realtime',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '24h',
  currency: 'USD',
  numberFormat: 'comma',
  sessionTimeout: 60,
  twoFactorEnabled: false,
  loginNotifications: true,
  defaultPageSize: 20,
  autoRefreshInterval: 0,
};

export const SETTINGS_KEY = 'app_general_settings';

export function loadSettingsFromStorage(): GeneralSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy "system" value to an explicit theme.
      if (parsed?.theme === 'system') {
        parsed.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Ignore malformed JSON and fall back to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

export function persistSettings(s: GeneralSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTheme(theme: GeneralSettings['theme']): 'dark' | 'light' {
  return theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(resolved: 'dark' | 'light') {
  const html = document.documentElement;
  // Set data-theme so ThemeContext's event handler reads the correct value
  html.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    html.classList.add('dark');
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  // Notify ThemeContext so its isDark stays in sync
  window.dispatchEvent(new CustomEvent('theme:changed'));
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<GeneralSettings>(loadSettingsFromStorage);
  const [isDark, setIsDark] = useState(() => resolveTheme(loadSettingsFromStorage().theme) === 'dark');

  // Auto-refresh timer ref
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Session timeout timer ref
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // ── Apply theme ──────────────────────────────────────────────────────
  useEffect(() => {
    const resolved = resolveTheme(settings.theme);
    applyTheme(resolved);
    setIsDark(resolved === 'dark');
  }, [settings.theme]);

  // ── Auto-refresh dashboard ────────────────────────────────────────────
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    if (settings.autoRefreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        // Dispatch a custom event; DashboardPage listens for it
        window.dispatchEvent(new CustomEvent('dashboard:refresh'));
      }, settings.autoRefreshInterval * 1000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [settings.autoRefreshInterval]);

  // ── Session timeout ───────────────────────────────────────────────────
  useEffect(() => {
    const clearTimer = () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };

    if (settings.sessionTimeout <= 0) {
      clearTimer();
      return;
    }

    const timeoutMs = settings.sessionTimeout * 60 * 1000;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      clearTimer();
      sessionTimerRef.current = setTimeout(() => {
        // Log out user by clearing tokens and reloading
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('session:timeout'));
        window.location.href = '/login';
      }, timeoutMs);
    };

    // Start immediately
    resetTimer();

    // Reset on user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const throttledReset = () => {
      const now = Date.now();
      // Only reset if > 30 seconds since last activity to avoid hammering
      if (now - lastActivityRef.current > 30_000) {
        resetTimer();
      }
    };

    events.forEach(e => document.addEventListener(e, throttledReset, { passive: true }));

    return () => {
      clearTimer();
      events.forEach(e => document.removeEventListener(e, throttledReset));
    };
  }, [settings.sessionTimeout]);

  // ── Push notifications permission ────────────────────────────────────
  useEffect(() => {
    if (settings.pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.pushNotifications]);

  // ── Persist on every change ───────────────────────────────────────────
  const updateSettings = useCallback((partial: Partial<GeneralSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      persistSettings(next);
      return next;
    });
  }, []);

  const saveSettings = useCallback(() => {
    persistSettings(settings);
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    persistSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, resetSettings, isDark }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
