// frontend/src/pages/settings/SettingsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import RolesManagementTab from './RolesManagementTab';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Users,
  ClipboardList,
  Shield,
  UserPlus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Bell,
  Moon,
  Sun,
  Globe,
  Palette,
  ShieldCheck,
  KeyRound,
  Download,
  AlertTriangle,
  Save,
  RotateCcw,
  Sliders,
  Database,
  Key,
  Check,
} from 'lucide-react';
import {
  ROLE_META,
  type RoleName,
} from '@/config/permissions';
import toast from 'react-hot-toast';
import { confirmWarning, confirmDelete } from '@/utils/confirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/config/constants';
import {
  useSettings,
  DEFAULT_SETTINGS,
  persistSettings,
  type GeneralSettings,
} from '@/contexts/SettingsContext';
import { preferencesService, type LanguageRegionPreferences } from '@/services/preferences.service';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

// ─── helpers ────────────────────────────────────────────────────────────────

const getRoles = (user: any): string[] =>
  user?.roles ?? (user?.role ? [user.role] : []);

const isAdmin = (user: any) =>
  getRoles(user).some(r => r.toUpperCase().includes('ADMIN'));

const isAdminOrAuditor = (user: any) =>
  getRoles(user).some(r =>
    r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('AUDITOR')
  );

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch { return null; }
}

// ─── types ───────────────────────────────────────────────────────────────────

interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  role?: string;
  status: string;
  isActive?: boolean;
  isLocked?: boolean;
  isEmailVerified?: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  timestamp: string;
}

// ─── shared small components ─────────────────────────────────────────────────

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    dir="ltr"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
  icon, title, subtitle,
}) => (
  <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-700 mb-6">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">{icon}</div>
    <div>
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
    </div>
  </div>
);

const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3 gap-4">
    <div className="min-w-0 rtl:text-right">
      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
      )}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SelectInput: React.FC<{
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  className?: string;
}> = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {options.map(o => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

type LanguageCode = 'en' | 'fr' | 'ar';

const FlagIcon = ({ code }: { code: LanguageCode }) => {
  // Simple inline SVG flags (no emoji/font dependency)
  if (code === 'fr') {
    return (
      <svg viewBox="0 0 3 2" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
        <rect width="1" height="2" x="0" y="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" y="0" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" y="0" fill="#EF4135" />
      </svg>
    );
  }
  if (code === 'ar') {
    // Morocco flag (red with green pentagram) for Arabic option
    return (
      <svg viewBox="0 0 60 40" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
        <rect width="60" height="40" fill="#C1272D" />
        <g transform="translate(30 20)" fill="none" stroke="#006233" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M0,-12 L3.5,-3.5 L12,-3.5 L5,1.5 L8.5,10 L0,5 L-8.5,10 L-5,1.5 L-12,-3.5 L-3.5,-3.5 Z" />
        </g>
      </svg>
    );
  }
  // GB-like flag (Union Jack simplified)
  return (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30,0 V30 M0,15 H60" stroke="#FFF" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
};

const LanguageSelect: React.FC<{
  value: LanguageCode;
  onChange: (v: LanguageCode) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const options: { value: LanguageCode; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
  ];
  const current = options.find(o => o.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FlagIcon code={current.value} />
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="w-4 h-4 text-neutral-400" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div
            role="listbox"
            className="absolute right-0 mt-2 w-44 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden z-50"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  opt.value === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <FlagIcon code={opt.value} />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ active?: boolean; locked?: boolean }> = ({ active, locked }) => {
  if (locked) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <Lock className="w-3 h-3" /> Locked
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'}`}>
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const clean = role.replace(/^ROLE_/, '');
  const colors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    WAREHOUSE_MANAGER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    SUPERVISOR: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    OPERATOR: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    PROCUREMENT: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    AUDITOR: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    USER: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[clean] ?? colors.USER}`}>
      {clean.replace(/_/g, ' ')}
    </span>
  );
};

const EmailVerifiedBadge: React.FC<{ verified?: boolean }> = ({ verified }) => {
  const { t } = useTranslation();
  return verified
    ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> {t('settings.users.verified')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <XCircle className="w-3 h-3" /> {t('settings.users.unverified')}
      </span>
    );
};

const AuditStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
    {status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {status}
  </span>
);

const Pagination: React.FC<{
  page: number; totalPages: number; totalElements: number;
  size: number; onPage: (p: number) => void;
}> = ({ page, totalPages, totalElements, size, onPage }) => {
  const { t } = useTranslation();
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('settings.audit.showing', { from, to, total: totalElements })}</p>
      <div className="flex gap-2">
        <button disabled={page === 0} onClick={() => onPage(page - 1)} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
          return (
            <button key={p} onClick={() => onPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-500 text-white' : 'border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
              {p + 1}
            </button>
          );
        })}
        <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── CREATE USER MODAL ────────────────────────────────────────────────────────

const AVAILABLE_ROLES = [
  'ADMIN', 'MANAGER', 'WAREHOUSE_MANAGER',
  'SUPERVISOR', 'OPERATOR', 'PROCUREMENT', 'AUDITOR', 'USER',
];

const CreateUserModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'USER' });
  const [autoGenPassword, setAutoGenPassword] = useState(true); // default: auto-generate
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email) {
      toast.error('Username and email are required');
      return;
    }
    if (!autoGenPassword && (!form.password || form.password.length < 8)) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.USERS.USERS, {
        username: form.username,
        email: form.email,
        // omit password when auto-generate is on — backend will generate it and send email
        ...(autoGenPassword ? {} : { password: form.password }),
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        roles: [form.role],
      });
      toast.success(
        autoGenPassword
          ? `Account created! Login credentials have been sent to ${form.email}`
          : `User "${form.username}" created successfully`,
      );
      onCreated();
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      // Show the first field validation error if present, otherwise the top-level message
      if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
        const firstEntry = Object.entries(data.validationErrors as Record<string, string>)[0];
        toast.error(`${firstEntry[0]}: ${firstEntry[1]}`);
      } else {
        toast.error(data?.message ?? 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Account</h2>
              <p className="text-sm text-blue-100">Add a new user to the system</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* ── Name row ── */}
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map(k => (
              <div key={k}>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {k === 'firstName' ? 'First Name' : 'Last Name'}
                </label>
                <input type="text" value={form[k]} onChange={set(k)}
                  placeholder={k === 'firstName' ? 'John' : 'Doe'}
                  className={inputCls} />
              </div>
            ))}
          </div>

          {/* ── Username + Email ── */}
          {(['username', 'email'] as const).map(k => (
            <div key={k}>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {k === 'username' ? 'Username' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type={k === 'email' ? 'email' : 'text'}
                value={form[k]} onChange={set(k)} required
                placeholder={k === 'username' ? 'johndoe' : 'john@company.com'}
                className={inputCls}
              />
            </div>
          ))}

          {/* ── Password section ── */}
          <div>
            {/* Toggle row */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => setAutoGenPassword(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                  autoGenPassword
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                )}
              >
                <span>{autoGenPassword ? '✓' : '○'}</span>
                Auto-generate &amp; email
              </button>
            </div>

            {/* Auto-generate notice */}
            {autoGenPassword ? (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-500 text-base mt-0.5">📧</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5">
                    Secure password will be auto-generated
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    A strong random password will be created and sent to the user's email address along with their username and login instructions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 8 characters"
                  className={cn(inputCls, 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* ── Role picker ── */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-0.5">
              {AVAILABLE_ROLES.map(r => {
                const meta = ROLE_META[r as RoleName];
                const active = form.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={cn(
                      'relative flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-xl border text-left transition-all duration-150',
                      active
                        ? `${meta.bg} border-current ${meta.color} ring-2 ring-inset ring-current`
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/60',
                    )}
                  >
                    {active && (
                      <span className={cn('absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full', meta.bg)}>
                        <Check className={cn('w-2.5 h-2.5', meta.color)} strokeWidth={3} />
                      </span>
                    )}
                    <span className={cn('text-[11px] font-bold leading-tight', active ? meta.color : 'text-neutral-700 dark:text-neutral-200')}>
                      {t(meta.label)}
                    </span>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-tight line-clamp-2">
                      {t(meta.description)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  );
};

// ─── CHANGE PASSWORD MODAL ────────────────────────────────────────────────────

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (form.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await apiClient.put('/api/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
    } finally { setLoading(false); }
  };

  const ToggleIcon = ({ field }: { field: keyof typeof showPwd }) => (
    <button type="button" onClick={() => setShowPwd(s => ({ ...s, [field]: !s[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
      {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><KeyRound className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Change Password</h2>
            <p className="text-sm text-neutral-500">Update your account password</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {([
            { key: 'currentPassword' as const, label: 'Current Password', field: 'current' as const },
            { key: 'newPassword' as const, label: 'New Password', field: 'new' as const },
            { key: 'confirmPassword' as const, label: 'Confirm New Password', field: 'confirm' as const },
          ]).map(({ key, label, field }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">{label} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPwd[field] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={setField(key)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ToggleIcon field={field} />
              </div>
            </div>
          ))}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            Password must be at least 8 characters with uppercase, lowercase, digit and special character.
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50">
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── GENERAL SETTINGS TAB ────────────────────────────────────────────────────

const GeneralSettingsTab: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { i18n, t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<GeneralSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'appearance' | 'notifications' | 'localization' | 'security' | 'data'>('appearance');
  const [showChangePwd, setShowChangePwd] = useState(false);

  // Sync local settings when context changes (e.g. on mount)
  useEffect(() => { setLocalSettings(settings); }, [settings]);

  // Live-preview: apply changes immediately to the context as user adjusts
  const set = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setLocalSettings(s => ({ ...s, [key]: value }));
    updateSettings({ [key]: value });
    if (key === 'language') {
      const lang = value as unknown as string;
      if (lang === 'en' || lang === 'fr' || lang === 'ar') {
        i18n.changeLanguage(lang);
      }
    }
  };

  const handleSave = async () => {
    persistSettings(localSettings);

    // Also persist localization preferences to backend (so it survives re-login)
    const numberFormat =
      localSettings.numberFormat === 'dot'
        ? '1.000,00'
        : '1,000.00';
    const lr: LanguageRegionPreferences = {
      language: localSettings.language,
      timezone: localSettings.timezone,
      dateFormat: localSettings.dateFormat,
      timeFormat: localSettings.timeFormat,
      firstDayOfWeek: 'monday',
      numberFormat,
      currency: localSettings.currency,
      weightUnit: 'kg',
      temperatureUnit: 'celsius',
    };
    await preferencesService.saveLanguageRegionPreferences(lr);

    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    const ok = await confirmWarning('Reset Settings', 'All settings will be restored to defaults. This cannot be undone.');
    if (!ok) return;
    resetSettings();
    setLocalSettings({ ...DEFAULT_SETTINGS });
    toast.success('Settings reset to defaults');
  };

  // Push notifications - request browser permission
  const handlePushToggle = (v: boolean) => {
    if (v && 'Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          set('pushNotifications', true);
          toast.success('Push notifications enabled');
        } else if (perm === 'denied') {
          toast.error('Notification permission denied. Enable in browser settings.');
        } else {
          set('pushNotifications', false);
        }
      });
    } else {
      set('pushNotifications', v);
    }
  };

  // Sound preview
  const handleSoundToggle = (v: boolean) => {
    set('soundEnabled', v);
    if (v) {
      // Play a brief test beep using Web Audio API
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // If audio is blocked/unavailable, just skip preview
      }
      toast.success('Sound alerts enabled');
    }
  };

  // Revoke all sessions
  const handleRevokeAllSessions = async () => {
    const ok = await confirmDelete('Revoke All Sessions', 'You will be logged out of all devices including this one.', 'Revoke');
    if (!ok) return;
    try {
      await safe(() => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT));
    } catch {
      // Best-effort: continue with local logout even if server call fails
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    toast.success('All sessions revoked. Redirecting to login…');
    setTimeout(() => { window.location.href = '/login'; }, 1500);
  };

  // Export settings as JSON download
  const handleExportSettings = () => {
    const blob = new Blob([JSON.stringify(localSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `app-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Settings exported');
  };

  // Export user data as JSON
  const handleExportUserData = () => {
    const raw = localStorage.getItem('user');
    const userData = raw ? JSON.parse(raw) : {};
    const blob = new Blob([JSON.stringify({ user: userData, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `user-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('User data exported');
  };

  const sections = [
    { id: 'appearance' as const, label: t('settings.appearance'), icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications' as const, label: t('settings.notifications'), icon: <Bell className="w-4 h-4" /> },
    { id: 'localization' as const, label: t('settings.localization'), icon: <Globe className="w-4 h-4" /> },
    { id: 'security' as const, label: t('settings.security'), icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'data' as const, label: t('settings.dataDisplay'), icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <>
    <div className="flex gap-0 min-h-[500px]">
      {/* Left sub-nav */}
      <div className="w-44 shrink-0 border-r border-neutral-200 dark:border-neutral-700 pr-4 space-y-1">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
              activeSection === s.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
            }`}
          >
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 pl-6 flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.12 }}>

              {/* ── APPEARANCE ── */}
              {activeSection === 'appearance' && (
                <div>
                  <SectionTitle icon={<Palette className="w-5 h-5" />} title={t('settings.appearance')} subtitle={t('settings.appearanceSubtitle')} />
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <SettingRow label={t('settings.theme')} description={t('settings.themeDesc')}>
                      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                        {([
                          { val: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: t('common.light') },
                          { val: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: t('common.dark') },
                        ] as const).map(t => (
                          <button key={t.val} onClick={() => set('theme', t.val)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${localSettings.theme === t.val ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                            {t.icon}{t.label}
                          </button>
                        ))}
                      </div>
                    </SettingRow>
                    <SettingRow label={t('settings.showAvatars')} description={t('settings.showAvatarsDesc')}>
                      <Toggle checked={localSettings.showAvatars} onChange={v => set('showAvatars', v)} />
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === 'notifications' && (
                <div>
                  <SectionTitle icon={<Bell className="w-5 h-5" />} title={t('settings.notifications')} subtitle={t('settings.notificationsSubtitle')} />
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <SettingRow label={t('settings.emailNotifications')} description={t('settings.emailNotificationsDesc')}>
                      <Toggle checked={localSettings.emailNotifications} onChange={v => set('emailNotifications', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.pushNotifications')} description={t('settings.pushNotificationsDesc')}>
                      <div className="flex items-center gap-2">
                        {'Notification' in window && Notification.permission === 'denied' && (
                          <span className="text-xs text-red-500 font-medium">{t('settings.pushBlocked')}</span>
                        )}
                        {'Notification' in window && Notification.permission === 'granted' && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{t('settings.pushAllowed')}</span>
                        )}
                        <Toggle checked={localSettings.pushNotifications} onChange={handlePushToggle} />
                      </div>
                    </SettingRow>
                    <SettingRow label={t('settings.soundAlerts')} description={t('settings.soundAlertsDesc')}>
                      <Toggle checked={localSettings.soundEnabled} onChange={handleSoundToggle} />
                    </SettingRow>

                    <div className="pt-4 pb-2">
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">{t('settings.alertTypes')}</p>
                    </div>

                    <SettingRow label={t('settings.lowStockAlerts')} description={t('settings.lowStockAlertsDesc')}>
                      <Toggle checked={localSettings.lowStockAlerts} onChange={v => set('lowStockAlerts', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.movementAlerts')} description={t('settings.movementAlertsDesc')}>
                      <Toggle checked={localSettings.movementAlerts} onChange={v => set('movementAlerts', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.qualityAlerts')} description={t('settings.qualityAlertsDesc')}>
                      <Toggle checked={localSettings.qualityAlerts} onChange={v => set('qualityAlerts', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.systemAlerts')} description={t('settings.systemAlertsDesc')}>
                      <Toggle checked={localSettings.systemAlerts} onChange={v => set('systemAlerts', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.alertFrequency')} description={t('settings.alertFrequencyDesc')}>
                      <SelectInput value={localSettings.alertFrequency} onChange={v => set('alertFrequency', v as any)}
                        options={[
                          { value: 'realtime', label: t('settings.frequencyRealtime') },
                          { value: 'hourly', label: t('settings.frequencyHourly') },
                          { value: 'daily', label: t('settings.frequencyDaily') },
                        ]} />
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* ── LOCALIZATION ── */}
              {activeSection === 'localization' && (
                <div>
                  <SectionTitle icon={<Globe className="w-5 h-5" />} title={t('settings.localization')} subtitle={t('settings.localizationSubtitle')} />
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <SettingRow label={t('settings.language')} description={t('settings.languageDesc')}>
                      <LanguageSelect
                        value={(localSettings.language as any) || 'en'}
                        onChange={(v) => set('language', v as any)}
                      />
                    </SettingRow>
                    <SettingRow label={t('settings.timezone')} description={t('settings.timezoneDesc')}>
                      <SelectInput value={localSettings.timezone} onChange={v => set('timezone', v)} className="w-48"
                        options={[
                          { value: 'UTC', label: 'UTC +0' },
                          { value: 'America/New_York', label: 'Eastern (ET) -5' },
                          { value: 'America/Chicago', label: 'Central (CT) -6' },
                          { value: 'America/Los_Angeles', label: 'Pacific (PT) -8' },
                          { value: 'Europe/London', label: 'London (GMT) +0' },
                          { value: 'Europe/Paris', label: 'Paris (CET) +1' },
                          { value: 'Africa/Algiers', label: 'Algiers (CET) +1' },
                          { value: 'Asia/Dubai', label: 'Dubai (GST) +4' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (JST) +9' },
                          { value: 'Asia/Shanghai', label: 'Shanghai (CST) +8' },
                        ]} />
                    </SettingRow>
                    <SettingRow label={t('settings.dateFormat')} description={t('settings.dateFormatDesc')}>
                      <div className="flex items-center gap-3">
                        <SelectInput value={localSettings.dateFormat} onChange={v => set('dateFormat', v)}
                          options={[
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                            { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
                          ]} />
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                          {t('settings.dateFormatPreview')}: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </SettingRow>
                    <SettingRow label={t('settings.timeFormat')} description={t('settings.timeFormatDesc')}>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                          {(['12h', '24h'] as const).map(t => (
                            <button key={t} onClick={() => set('timeFormat', t)}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${localSettings.timeFormat === t ? 'bg-white dark:bg-neutral-700 text-blue-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {localSettings.timeFormat === '12h'
                            ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    </SettingRow>
                    <SettingRow label={t('settings.currency')} description={t('settings.currencyDesc')}>
                      <SelectInput value={localSettings.currency} onChange={v => set('currency', v)}
                        options={[
                          { value: 'USD', label: 'USD – US Dollar ($)' },
                          { value: 'EUR', label: 'EUR – Euro (€)' },
                          { value: 'GBP', label: 'GBP – British Pound (£)' },
                          { value: 'DZD', label: 'DZD – Algerian Dinar (دج)' },
                          { value: 'MAD', label: 'MAD – Moroccan Dirham (د.م)' },
                          { value: 'SAR', label: 'SAR – Saudi Riyal (﷼)' },
                          { value: 'AED', label: 'AED – UAE Dirham (د.إ)' },
                          { value: 'JPY', label: 'JPY – Japanese Yen (¥)' },
                          { value: 'CNY', label: 'CNY – Chinese Yuan (¥)' },
                        ]} />
                    </SettingRow>
                    <SettingRow label={t('settings.numberFormat')} description={t('settings.numberFormatDesc')}>
                      <div className="flex items-center gap-3">
                        <SelectInput value={localSettings.numberFormat} onChange={v => set('numberFormat', v as any)}
                          options={[
                            { value: 'comma', label: '1,000.00 (Comma)' },
                            { value: 'dot', label: '1.000,00 (Dot)' },
                          ]} />
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {localSettings.numberFormat === 'comma' ? '1,234.56' : '1.234,56'}
                        </span>
                      </div>
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === 'security' && (
                <div>
                  <SectionTitle icon={<ShieldCheck className="w-5 h-5" />} title={t('settings.security')} subtitle={t('settings.securitySubtitle')} />
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">

                    <SettingRow label={t('settings.loginNotifications')} description={t('settings.loginNotificationsDesc')}>
                      <Toggle checked={localSettings.loginNotifications} onChange={v => set('loginNotifications', v)} />
                    </SettingRow>
                    <SettingRow label={t('settings.sessionTimeout')} description={t('settings.sessionTimeoutDesc')}>
                      <SelectInput value={localSettings.sessionTimeout} onChange={v => {
                        const val = Number(v);
                        set('sessionTimeout', val);
                        toast.success(val === 0 ? 'Session timeout disabled' : `Session timeout set to ${v} minutes`);
                      }}
                        options={[
                          { value: 0, label: t('settings.timeoutNever') },
                          { value: 15, label: t('settings.timeout15') },
                          { value: 30, label: t('settings.timeout30') },
                          { value: 60, label: t('settings.timeout60') },
                          { value: 120, label: t('settings.timeout120') },
                          { value: 480, label: t('settings.timeout480') },
                        ]} />
                    </SettingRow>
                    <div className="py-4">
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">{t('settings.quickActions')}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowChangePwd(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <KeyRound className="w-4 h-4 text-blue-500" />
                          {t('settings.changePassword')}
                        </button>
                        <button
                          onClick={handleRevokeAllSessions}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                          <AlertTriangle className="w-4 h-4" />
                          {t('settings.revokeAllSessions')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DATA & DISPLAY ── */}
              {activeSection === 'data' && (
                <div>
                  <SectionTitle icon={<Sliders className="w-5 h-5" />} title={t('settings.dataDisplay')} subtitle={t('settings.dataDisplaySubtitle')} />
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <SettingRow label={t('settings.defaultPageSize')} description={t('settings.defaultPageSizeDesc')}>
                      <SelectInput value={localSettings.defaultPageSize} onChange={v => set('defaultPageSize', Number(v))}
                        options={[
                          { value: 10, label: t('settings.rows10') },
                          { value: 20, label: t('settings.rows20') },
                          { value: 50, label: t('settings.rows50') },
                          { value: 100, label: t('settings.rows100') },
                        ]} />
                    </SettingRow>
                    <SettingRow label={t('settings.autoRefresh')} description={t('settings.autoRefreshDesc')}>
                      <div className="flex items-center gap-3">
                        <SelectInput value={localSettings.autoRefreshInterval} onChange={v => {
                          const val = Number(v);
                          set('autoRefreshInterval', val);
                          toast.success(val === 0 ? 'Auto-refresh disabled' : `Dashboard will refresh every ${v}s`);
                        }}
                          options={[
                            { value: 0, label: t('settings.autoRefreshDisabled') },
                            { value: 30, label: t('settings.autoRefresh30') },
                            { value: 60, label: t('settings.autoRefresh60') },
                            { value: 300, label: t('settings.autoRefresh300') },
                            { value: 600, label: t('settings.autoRefresh600') },
                          ]} />
                        {localSettings.autoRefreshInterval > 0 && (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <RefreshCw className="w-3 h-3 animate-spin" /> {t('settings.autoRefreshActive')}
                          </span>
                        )}
                      </div>
                    </SettingRow>
                    <SettingRow label={t('settings.showAvatars')} description={t('settings.showAvatarsDesc')}>
                      <Toggle checked={localSettings.showAvatars} onChange={v => set('showAvatars', v)} />
                    </SettingRow>
                    <div className="py-4">
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">{t('settings.dataExport')}</p>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={handleExportSettings} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <Download className="w-4 h-4 text-green-500" />
                          {t('settings.exportSettings')}
                        </button>
                        <button onClick={handleExportUserData} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <Database className="w-4 h-4 text-blue-500" />
                          {t('settings.exportUserData')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
            <RotateCcw className="w-4 h-4" /> {t('common.resetDefaults')}
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all ${saved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'}`}>
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? t('common.save') + '!' : t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>

    {/* Change Password Modal */}
    <AnimatePresence>
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
    </AnimatePresence>
    </>
  );
};

// ─── DELETE CONFIRM DIALOG ───────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  username: string;
  email?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  username, email, onConfirm, onCancel, isDeleting,
}) => {
  const { t } = useTranslation();
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={!isDeleting ? onCancel : undefined}
    />

    {/* Dialog card */}
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Red accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

      <div className="p-7">
        {/* Icon + title row */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div className="pt-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              {t('users.delete.title')}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t('users.delete.subtitle')}
            </p>
          </div>
        </div>

        {/* User info card */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
            {username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              @{username}
            </p>
            {email && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{email}</p>
            )}
          </div>
        </div>

        {/* Warning message */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
            {t('users.delete.warning', { username })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-5 py-3 rounded-2xl text-sm font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 disabled:opacity-60 transition-all shadow-sm shadow-red-200 dark:shadow-red-900/30 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('users.delete.deleting')}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {t('users.delete.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
  );
};

// ─── RESET PASSWORD CONFIRM DIALOG ───────────────────────────────────────────

interface ResetPasswordConfirmDialogProps {
  username: string;
  email: string;
  onConfirm: () => void;
  onCancel: () => void;
  isResetting: boolean;
}

const ResetPasswordConfirmDialog: React.FC<ResetPasswordConfirmDialogProps> = ({
  username, email, onConfirm, onCancel, isResetting,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={!isResetting ? onCancel : undefined}
    />

    {/* Dialog card */}
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Violet accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <div className="p-7">
        {/* Icon + title row */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shadow-inner">
            <KeyRound className="w-7 h-7 text-violet-500" />
          </div>
          <div className="pt-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              A new password will be generated and emailed
            </p>
          </div>
        </div>

        {/* User info card */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 mb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
            {username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">@{username}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{email}</p>
          </div>
        </div>

        {/* Info message */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-6">
          <KeyRound className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
          <p className="text-sm text-violet-700 dark:text-violet-300 leading-relaxed">
            A secure password will be generated and sent to <strong>{email}</strong>. The user must log in and change it immediately.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isResetting}
            className="flex-1 px-5 py-3 rounded-2xl text-sm font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isResetting}
            className="flex-1 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/30 flex items-center justify-center gap-2"
          >
            {isResetting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Send New Password
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// ─── USER MANAGEMENT TAB ─────────────────────────────────────────────────────

const UserManagementTab: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; username: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; username: string; email: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const pageSize = 10;

  const fetchUsers = useCallback(async (p = page) => {
    setLoading(true);
    const res = await safe(() =>
      apiClient.get(API_ENDPOINTS.USERS.USERS, { params: { page: p, size: pageSize, sortBy: 'username', sortDir: 'asc' } })
    );
    if (res?.data) {
      const d = res.data as any;
      if (Array.isArray(d)) { setUsers(d); setTotalElements(d.length); setTotalPages(1); }
      else { setUsers(d.content ?? []); setTotalElements(d.totalElements ?? 0); setTotalPages(d.totalPages ?? 1); }
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchUsers(page); }, [page]);

  const filtered = search
    ? users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const doAction = async (action: string, userId: string, label: string) => {
    setActionLoading(userId + action);
    try { await apiClient.patch(`${API_ENDPOINTS.USERS.USERS}/${userId}/${action}`); toast.success(label); fetchUsers(page); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? `${t('common.failed')}: ${label}`); }
    finally { setActionLoading(null); }
  };

  const doDelete = (userId: string, username: string, email: string) => {
    setDeleteTarget({ id: userId, username, email });
  };

  const doResetPassword = (userId: string, username: string, email: string) => {
    setResetTarget({ id: userId, username, email });
  };

  const confirmResetPassword = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    setActionLoading(resetTarget.id + 'reset-password');
    try {
      const res = await apiClient.post(`${API_ENDPOINTS.USERS.USERS}/${resetTarget.id}/reset-password`);
      toast.success(res.data?.message ?? `New password sent to ${resetTarget.email}`);
      setResetTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to reset password');
    } finally {
      setIsResetting(false);
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionLoading(deleteTarget.id + 'delete');
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.USER_BY_ID(deleteTarget.id));
      toast.success(t('users.delete.success', { username: deleteTarget.username }));
      setDeleteTarget(null);
      fetchUsers(page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('users.delete.error'));
    } finally {
      setIsDeleting(false);
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder={t('users.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchUsers(page)} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700" title={t('common.refresh')}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90">
            <UserPlus className="w-4 h-4" /> {t('users.createAccount')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('users.totalUsers'), value: totalElements, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('users.active'), value: users.filter(u => u.isActive !== false && u.status !== 'INACTIVE').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: t('users.locked'), value: users.filter(u => u.isLocked).length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: t('users.admins'), value: users.filter(u => (u.roles ?? [u.role ?? '']).some(r => r.toUpperCase().includes('ADMIN'))).length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60">
            <tr>{[
              t('users.table.user'),
              t('users.table.email'),
              t('users.table.role'),
              t('users.table.emailVerified'),
              t('users.table.status'),
              t('users.table.lastLogin'),
              t('users.table.actions')
            ].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="px-4 py-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>
              ))}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">{t('users.noUsersFound')}</td></tr>
            ) : filtered.map(u => {
              const roles = u.roles ?? (u.role ? [u.role] : ['USER']);
              const active = u.isActive !== false && u.status !== 'INACTIVE';
              const busy = (a: string) => actionLoading === u.id + a;
              return (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {settings.showAvatars && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(u.firstName?.[0] ?? u.username[0]).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username}</p>
                        {settings.showAvatars ? (
                          <p className="text-xs text-neutral-500">@{u.username}</p>
                        ) : (
                          <p className="text-xs text-neutral-500">{u.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{roles.map(r => <RoleBadge key={r} role={r} />)}</div></td>
                  <td className="px-4 py-3"><EmailVerifiedBadge verified={u.isEmailVerified} /></td>
                  <td className="px-4 py-3"><StatusBadge active={active} locked={u.isLocked} /></td>
                  <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {active ? (
                        <button title={t('users.actions.deactivate')} disabled={!!actionLoading} onClick={() => doAction('deactivate', u.id, t('users.actions.deactivated', { username: u.username }))} className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-40">
                          {busy('deactivate') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                        </button>
                      ) : (
                        <button title={t('users.actions.activate')} disabled={!!actionLoading} onClick={() => doAction('activate', u.id, t('users.actions.activated', { username: u.username }))} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-40">
                          {busy('activate') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                      {u.isLocked ? (
                        <button title={t('users.actions.unlock')} disabled={!!actionLoading} onClick={() => doAction('unlock', u.id, t('users.actions.unlocked', { username: u.username }))} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40">
                          {busy('unlock') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      ) : (
                        <button title={t('users.actions.lock')} disabled={!!actionLoading} onClick={() => doAction('lock', u.id, t('users.actions.locked', { username: u.username }))} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-40">
                          {busy('lock') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        </button>
                      )}
                      <button title="Reset & send new password" disabled={!!actionLoading} onClick={() => doResetPassword(u.id, u.username, u.email)} className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-40">
                        {busy('reset-password') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                      </button>
                      <button title={t('users.actions.delete')} disabled={!!actionLoading} onClick={() => doDelete(u.id, u.username, u.email)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40">
                        {busy('delete') ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={pageSize} onPage={p => setPage(p)} />}

      <AnimatePresence>
        {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} onCreated={() => fetchUsers(0)} />}
        {deleteTarget && (
          <DeleteConfirmDialog
            username={deleteTarget.username}
            email={deleteTarget.email}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
        {resetTarget && (
          <ResetPasswordConfirmDialog
            username={resetTarget.username}
            email={resetTarget.email}
            onConfirm={confirmResetPassword}
            onCancel={() => setResetTarget(null)}
            isResetting={isResetting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── AUDIT LOGS TAB ───────────────────────────────────────────────────────────

// Resource type → display label + color
const RESOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  PRODUCT:        { label: 'Product',       color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  CATEGORY:       { label: 'Category',      color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  VARIANT:        { label: 'Variant',       color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/60 dark:bg-purple-900/10' },
  QUOTE:          { label: 'Quote',         color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20' },
  CUSTOMER:       { label: 'Customer',      color: 'text-cyan-700 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  DELIVERY_NOTE:  { label: 'Delivery Note', color: 'text-teal-700 dark:text-teal-400',     bg: 'bg-teal-50 dark:bg-teal-900/20' },
  INVENTORY:      { label: 'Inventory',     color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  LOT:            { label: 'Lot',           color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/20' },
  SERIAL:         { label: 'Serial',        color: 'text-lime-700 dark:text-lime-400',     bg: 'bg-lime-50 dark:bg-lime-900/20' },
  MOVEMENT:       { label: 'Movement',      color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  MOVEMENT_LINE:  { label: 'Mvt. Line',     color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50/60 dark:bg-amber-900/10' },
  MOVEMENT_TASK:  { label: 'Mvt. Task',     color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  PURCHASE_ORDER: { label: 'Purchase Order',color: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/20' },
  SUPPLIER:       { label: 'Supplier',      color: 'text-pink-700 dark:text-pink-400',     bg: 'bg-pink-50 dark:bg-pink-900/20' },
  LOCATION:       { label: 'Location',      color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  SITE:           { label: 'Site',          color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/60 dark:bg-indigo-900/10' },
  WAREHOUSE:      { label: 'Warehouse',     color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50/60 dark:bg-blue-900/10' },
};

type AuditFilter = 'all' | 'failed' | 'security' | 'crud';

const AuditLogsTab: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState<AuditFilter>('all');
  const [resourceFilter, setResourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const fetchLogs = useCallback(async (p = page, f = filter) => {
    setLoading(true);
    try {
      const endpoint =
        f === 'failed'   ? '/api/audit/failed-logins' :
        f === 'security' ? '/api/audit/security-events' :
        '/api/audit';
      const params = f === 'crud'
        ? { page: 0, size: 200, sortBy: 'timestamp', sortDirection: 'DESC' }
        : { page: p, size: pageSize, sortBy: 'timestamp', sortDirection: 'DESC' };

      const res = await apiClient.get(endpoint, { params });
      const d = res.data as any;
      const all: AuditLog[] = Array.isArray(d) ? d : (d.content ?? []);

      if (f === 'crud') {
        const CRUD_ACTIONS_LIST = ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'IMPORT', 'EXPORT'];
        const crud = all.filter(l => CRUD_ACTIONS_LIST.some(a => l.action.includes(a)));
        setLogs(crud);
        setTotalElements(crud.length);
        setTotalPages(1);
      } else {
        setLogs(all);
        setTotalElements(d.totalElements ?? all.length);
        setTotalPages(d.totalPages ?? 1);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      console.error('[AuditLogs] fetch failed — status:', status, '| message:', msg, '| full error:', err);
      if (status === 401 || status === 403) {
        toast.error(`Access denied (${status}) — check your role/token`);
      } else {
        toast.error(`Failed to load audit logs (${status ?? 'network error'})`);
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchLogs(page, filter); }, [page, filter]);

  // Reset page when search / resource filter changes
  useEffect(() => { setPage(0); }, [search, resourceFilter]);

  const filtered = logs.filter(l => {
    if (resourceFilter && l.resourceType !== resourceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (l.username ?? '').toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.resourceType ?? '').toLowerCase().includes(q) ||
        (l.details ?? '').toLowerCase().includes(q) ||
        (l.ipAddress ?? '').includes(q)
      );
    }
    return true;
  });

  // For CRUD tab: client-side pagination over filtered results
  // For other tabs: server already paginated — show filtered as-is
  const isCrud = filter === 'crud';
  const effectiveTotalElements = isCrud ? filtered.length : totalElements;
  const effectiveTotalPages    = isCrud ? Math.max(1, Math.ceil(filtered.length / pageSize)) : totalPages;
  const displayedLogs          = isCrud ? filtered.slice(page * pageSize, (page + 1) * pageSize) : filtered;

  const actionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a === 'CREATE')        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (a === 'UPDATE')        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    if (a === 'DELETE')        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (a === 'STATUS_CHANGE') return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (a === 'IMPORT')        return 'text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20';
    if (a.includes('LOGIN'))   return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
    if (a.includes('LOGOUT'))  return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700';
    if (a.includes('LOCK'))         return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    if (a === 'ACCOUNT_DEACTIVATED') return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (a === 'ACCOUNT_ACTIVATED')   return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
    if (a.includes('PASSWORD') || a.includes('RESET')) return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-700';
  };

  // Unique resource types present in current page
  const presentTypes = Array.from(new Set(logs.map(l => l.resourceType).filter(Boolean))) as string[];

  const FILTER_TABS: { id: AuditFilter; label: string }[] = [
    { id: 'all',      label: t('audit.allLogs') },
    { id: 'crud',     label: 'CRUD' },
    { id: 'failed',   label: t('audit.failedLogins') },
    { id: 'security', label: t('audit.securityEvents') },
  ];

  const crudCount   = logs.filter(l => ['CREATE','UPDATE','DELETE','STATUS_CHANGE','IMPORT','EXPORT'].some(a => l.action.includes(a))).length;
  const createCount = logs.filter(l => l.action === 'CREATE').length;
  const updateCount = logs.filter(l => l.action === 'UPDATE').length;
  const deleteCount = logs.filter(l => l.action === 'DELETE').length;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setPage(0); setResourceFilter(''); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Resource type filter */}
          {presentTypes.length > 0 && (
            <select
              value={resourceFilter}
              onChange={e => setResourceFilter(e.target.value)}
              className="text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              <option value="">All resources</option>
              {presentTypes.map(rt => (
                <option key={rt} value={rt}>{RESOURCE_META[rt]?.label ?? rt}</option>
              ))}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-400 w-40" />
          </div>
          <button onClick={() => fetchLogs(page, filter)} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('audit.totalLogs'),   value: totalElements,                                       color: 'text-primary-600',  bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: t('settings.audit.crudOperations'), value: crudCount,                                 color: 'text-emerald-600',  bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('audit.failed'),       value: logs.filter(l => l.status === 'FAILURE').length,    color: 'text-red-600',      bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: t('audit.uniqueUsers'),  value: new Set(logs.map(l => l.username).filter(Boolean)).size, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── CRUD breakdown pills (only when in CRUD mode) ── */}
      {filter === 'crud' && (
        <div className="flex gap-2 flex-wrap text-xs">
          {[
            { label: `Create (${createCount})`, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
            { label: `Update (${updateCount})`, color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
            { label: `Delete (${deleteCount})`, color: 'text-red-700 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
          ].map(p => (
            <span key={p.label} className={`px-2.5 py-1 rounded-full font-semibold border ${p.color}`}>{p.label}</span>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60">
            <tr>
              {[t('settings.audit.timestamp'), t('settings.audit.user'), t('settings.audit.action'), t('settings.audit.resource'), t('settings.audit.description'), t('settings.audit.status')].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((__, j) => (
                <td key={j} className="px-3 py-3"><div className="h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>
              ))}</tr>
            )) : displayedLogs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-400 text-sm">{t('audit.noLogsFound')}</td></tr>
            ) : displayedLogs.map(log => {
              const rm = log.resourceType ? RESOURCE_META[log.resourceType] : null;
              return (
                <tr key={log.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${log.status === 'FAILURE' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                  <td className="px-3 py-2.5 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {(log.firstName || log.lastName) ? (
                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                          {[log.firstName, log.lastName].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-neutral-400 dark:text-neutral-500 leading-tight">
                          @{log.username}
                        </p>
                      </div>
                    ) : (
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {log.username ?? log.userId ?? '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {rm ? (
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${rm.color} ${rm.bg}`}>
                        {rm.label}
                      </span>
                    ) : log.resourceType ? (
                      <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-semibold text-neutral-600 bg-neutral-100 dark:bg-neutral-700">
                        {log.resourceType}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs max-w-[220px]">
                    {log.details ? (
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400 truncate" title={log.details}>
                          {log.details}
                        </p>
                        {log.action === 'LOGIN_FAILED' && log.ipAddress && (
                          <p className="text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                            {log.ipAddress}
                          </p>
                        )}
                      </div>
                    ) : log.action === 'LOGIN_FAILED' && log.ipAddress ? (
                      <p className="text-neutral-400 dark:text-neutral-500 font-mono">
                        {log.ipAddress}
                      </p>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5"><AuditStatusBadge status={log.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={effectiveTotalPages} totalElements={effectiveTotalElements} size={pageSize} onPage={p => setPage(p)} />
    </div>
  );
};

// ─── PERMISSIONS TAB ─────────────────────────────────────────────────────────

const PermissionsTab: React.FC = () => <RolesManagementTab />;

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

type TabId = 'general' | 'users' | 'permissions' | 'logs';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const admin = isAdmin(user);
  const adminOrAuditor = isAdminOrAuditor(user);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  useEffect(() => {
    if (activeTab === 'users' && !admin) setActiveTab('general');
    if (activeTab === 'permissions' && !admin) setActiveTab('general');
    if (activeTab === 'logs' && !adminOrAuditor) setActiveTab('general');
  }, [activeTab, admin, adminOrAuditor]);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; desc: string; visible: boolean; badge?: string }[] = [
    { id: 'general', label: t('settings.general'), icon: <Sliders className="w-4 h-4" />, desc: `${t('settings.appearance')}, ${t('settings.notifications')}, ${t('settings.localization')}`, visible: true },
    { id: 'users', label: t('settings.userManagement'), icon: <Users className="w-4 h-4" />, desc: t('settings.userManagementDesc'), visible: admin, badge: 'Admin' },
    { id: 'permissions', label: t('settings.permissions'), icon: <Key className="w-4 h-4" />, desc: t('settings.permissionsDesc'), visible: admin, badge: 'Admin' },
    { id: 'logs', label: t('settings.auditLogs'), icon: <ClipboardList className="w-4 h-4" />, desc: t('settings.auditLogsDesc'), visible: adminOrAuditor, badge: adminOrAuditor && !admin ? t('layout.auditor') : undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" /> {t('settings.title')}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t('settings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {admin ? t('layout.administrator') : adminOrAuditor ? t('layout.auditor') : t('layout.member')}
          </span>
        </div>
      </div>

      {/* Main layout: left sidebar nav + content */}
      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-56 shrink-0 space-y-1">
          {tabs.filter(t => t.visible).map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                activeTab === t.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent'
              }`}>
              <span className={`mt-0.5 ${activeTab === t.id ? 'text-blue-500' : 'text-neutral-400'}`}>{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${activeTab === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {t.label}
                  </span>
                  {t.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content card */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              {activeTab === 'general' && <GeneralSettingsTab />}
              {activeTab === 'users' && (admin ? <UserManagementTab /> : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
                  <Lock className="w-10 h-10" /><p className="font-semibold">{t('auth.adminRequired') || 'Admin access required'}</p>
                </div>
              ))}
              {activeTab === 'permissions' && (admin ? <PermissionsTab /> : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
                  <Lock className="w-10 h-10" /><p className="font-semibold">{t('auth.adminRequired') || 'Admin access required'}</p>
                </div>
              ))}
              {activeTab === 'logs' && (adminOrAuditor ? <AuditLogsTab /> : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
                  <Lock className="w-10 h-10" /><p className="font-semibold">{t('auth.adminOrAuditorRequired') || 'Admin or Auditor access required'}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
