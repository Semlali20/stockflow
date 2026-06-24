import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Key,
  CheckCircle,
  XCircle,
  Edit3,
  Camera,
  Trash2,
  Lock,
  Bell,
  AtSign,
  BadgeCheck,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { userService, UserUpdateRequest } from '@/services/user.service';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ProfileDetailModal } from '@/components/profile/ProfileDetailModal';
import { ProfileFormModal } from '@/components/profile/ProfileFormModal';
import { NotificationPreferencesModal } from '@/components/profile/NotificationPreferencesModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { preferencesService, NotificationPreferences } from '@/services/preferences.service';
import { cn } from '@/utils/cn';

// Strip ROLE_ prefix from role strings
const formatRole = (role: string) =>
  role.replace(/^ROLE_/i, '').replace(/_/g, ' ');

const ROLE_GRADIENTS: Record<string, string> = {
  ADMIN: 'from-amber-500 to-orange-500',
  MANAGER: 'from-indigo-500 to-blue-500',
  WAREHOUSE_MANAGER: 'from-cyan-500 to-teal-500',
  SUPERVISOR: 'from-violet-500 to-purple-500',
  OPERATOR: 'from-pink-500 to-rose-500',
  PROCUREMENT: 'from-sky-500 to-blue-500',
  AUDITOR: 'from-slate-500 to-gray-500',
};

const getRoleGradient = (roles: string[]) => {
  const r = roles[0]?.replace(/^ROLE_/i, '') ?? '';
  return ROLE_GRADIENTS[r] ?? 'from-indigo-500 to-purple-500';
};

// Info row used in both view and edit mode
const InfoRow = ({
  icon: Icon,
  label,
  value,
  locked,
  lockNote,
  editing,
  editValue,
  onEdit,
  type = 'text',
  placeholder,
  t,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  locked?: boolean;
  lockNote?: string;
  editing?: boolean;
  editValue?: string;
  onEdit?: (v: string) => void;
  type?: string;
  placeholder?: string;
  t: (key: string) => string;
}) => (
  <div className="flex items-start gap-4 py-4 border-b border-neutral-100 dark:border-neutral-700/60 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-700/60 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {editing && !locked ? (
        <Input
          type={type}
          value={editValue ?? ''}
          onChange={(e) => onEdit?.(e.target.value)}
          placeholder={placeholder}
          className="font-medium"
        />
      ) : (
        <>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {value || t('profile.notSet')}
          </p>
          {locked && lockNote && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {lockNote}
            </p>
          )}
        </>
      )}
    </div>
  </div>
);

// ─── Stat mini card
const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/40">
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{value}</p>
    </div>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUser();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await preferencesService.loadPreferencesFromBackend();
    setNotificationPrefs(prefs.notifications);
    setLanguagePrefs(prefs.languageRegion);
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.profileImageUrl) setProfileImage(currentUser.profileImageUrl);
      }
    } catch {
      const localUser = authService.getCurrentUser();
      if (localUser) setUser(localUser);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    await fetchUser();
    setShowFormModal(false);
  };

  const handleSaveNotificationPreferences = async (prefs: NotificationPreferences) => {
    await preferencesService.saveNotificationPreferences(prefs);
    setNotificationPrefs(prefs);
  };

  const handleEdit = () => { setIsEditing(true); setEditedUser(user || {}); };
  const handleCancel = () => { setIsEditing(false); setEditedUser(user || {}); setImageFile(null); };

  const handleSave = async () => {
    if (!user) return;
    try {
      const updateData: UserUpdateRequest = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phoneNumber: editedUser.phoneNumber || editedUser.phone,
        email: editedUser.email,
      };
      if (profileImage) updateData.profileImageUrl = profileImage;
      const updatedUser = await userService.updateUser(user.id, updateData);
      setUser(updatedUser);
      setEditedUser(updatedUser);
      if (profileImage) localStorage.setItem(`profile_image_${user.id}`, profileImage);
      toast.success(t('profile.updateSuccess')); // Translated
      setIsEditing(false);
      setImageFile(null);
    } catch (error: any) {
      console.error('Failed to update profile:', error); // Simplified error logging from diff
      toast.error(t('profile.updateError')); // Translated
    }
  };

  const handleChange = (field: keyof User, value: string) =>
    setEditedUser(prev => ({ ...prev, [field]: value }));

  const handleImageClick = () => { if (isEditing) fileInputRef.current?.click(); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageSizeError')); // Translated
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.imageTypeError')); // Translated
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX = 400;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height = (height * MAX) / width; width = MAX; } }
        else { if (height > MAX) { width = (width * MAX) / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        if (compressedBase64.length > 500 * 1024) {
          toast.error(t('profile.imageCompressionError'));
          return;
        }
        setProfileImage(compressedBase64);
        setImageFile(file);
        toast.success(t('profile.imageSelected'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null); setImageFile(null);
    if (user) localStorage.removeItem(`profile_image_${user.id}`);
    toast.success(t('profile.imageRemoved'));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('profile.notSet'); // Translated
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.username) return user.username.substring(0, 2).toUpperCase();
    return 'U';
  };

  const userRoles = user?.roles ?? (user?.role ? [user.role] : []);
  const roleGradient = getRoleGradient(userRoles);
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '';

  // ─── Loading
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {t('profile.loading')} {/* Translated */}
        </p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserIcon size={40} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('profile.noUserData')} {/* Translated */}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t('profile.loginRequired')} {/* Translated */}
        </p>
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold rounded-xl transition-all"
          onClick={() => navigate('/login')}
        >
          {t('auth.login.signInBtn')} {/* Translated */}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {t('profile.title')} {/* Translated */}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            {t('profile.subtitle')} {/* Translated */}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-semibold"
              >
                {t('profile.cancel')}
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all font-semibold"
                onClick={handleSave}
              >
                {t('profile.saveChanges')}
              </Button>
            </>
          ) : (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 font-semibold"
              onClick={() => setShowFormModal(true)}
            >
              <Edit3 size={18} />
              {t('profile.editProfile')}
            </Button>
          )}
        </div>
      </motion.div>

      {/* ── Hero Card ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm overflow-hidden"
      >
        <div className="px-8 py-10 border-b border-neutral-100 dark:border-neutral-700/60 transition-all duration-300">
          {/* Avatar + Identity */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-8 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl ring-4 ring-white dark:ring-neutral-800 bg-neutral-100 dark:bg-neutral-700 overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300">
                {profileImage ? (
                  <img src={profileImage} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center text-white', roleGradient)}>
                    <span className="text-3xl font-bold">{getUserInitials()}</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <button
                    onClick={handleImageClick}
                    className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
                    title="Upload photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* Name + Role */}
            <div className="sm:mb-2 flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex flex-col">
                  <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-neutral-50 drop-shadow-sm tracking-tight">
                    {fullName || user.username}
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {userRoles.length > 0 && (
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r shadow-lg shadow-primary-500/20',
                      roleGradient,
                    )}>
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {userRoles.map(r => formatRole(r)).join(' · ')}
                    </span>
                  )}

                  {(user.isActive === true || user.status === 'ACTIVE') ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-700/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {t('profile.active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-700/30">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {t('profile.inactive')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <StatCard
              label={t('profile.memberSince')}
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : t('common.na')}
              icon={Calendar}
              color="bg-primary-500"
            />
            <StatCard
              label={t('profile.lastLogin')}
              value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : t('common.na')}
              icon={Clock}
              color="bg-violet-500"
            />
            <StatCard
              label={t('profile.role')}
              value={userRoles.map(r => formatRole(r)).join(', ') || t('profile.noRole')}
              icon={Shield}
              color="bg-amber-500"
            />
            <StatCard
              label={t('profile.status')}
              value={(user.isActive === true || user.status === 'ACTIVE') ? t('profile.active') : t('profile.inactive')}
              icon={Activity}
              color={(user.isActive === true || user.status === 'ACTIVE') ? 'bg-emerald-500' : 'bg-red-500'}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Two-column info grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              {t('profile.personalInfo')}
            </h3>
          </div>

          <InfoRow
            icon={UserIcon}
            label={t('profile.firstName')}
            value={user.firstName || ''}
            editing={isEditing}
            editValue={editedUser.firstName || ''}
            onEdit={v => handleChange('firstName', v)}
            placeholder={t('profile.firstNamePlaceholder')}
            t={t}
          />
          <InfoRow
            icon={UserIcon}
            label={t('profile.lastName')}
            value={user.lastName || ''}
            editing={isEditing}
            editValue={editedUser.lastName || ''}
            onEdit={v => handleChange('lastName', v)}
            placeholder={t('profile.lastNamePlaceholder')}
            t={t}
          />
          <InfoRow
            icon={Mail}
            label={t('profile.email')}
            value={user.email || ''}
            locked
            lockNote={t('profile.emailLocked')}
            t={t}
          />
          <InfoRow
            icon={Phone}
            label={t('profile.phone')}
            value={user.phoneNumber || user.phone || ''}
            editing={isEditing}
            editValue={editedUser.phoneNumber || editedUser.phone || ''}
            onEdit={v => handleChange('phoneNumber', v)}
            type="tel"
            placeholder={t('profile.phonePlaceholder')}
            t={t}
          />
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <Key className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              {t('profile.accountInfo')}
            </h3>
          </div>

          <InfoRow
            icon={AtSign}
            label={t('profile.username')}
            value={user.username || ''}
            locked
            lockNote={t('profile.usernameLocked')}
            t={t}
          />
          <InfoRow
            icon={Shield}
            label={t('profile.rolePermissions')}
            value={userRoles.map(r => formatRole(r)).join(', ') || t('profile.noRole')}
            t={t}
          />
          <InfoRow
            icon={Clock}
            label={t('profile.lastLogin')}
            value={formatDate(user.lastLogin)}
            t={t}
          />
          <InfoRow
            icon={Calendar}
            label={t('profile.accountCreated')}
            value={formatDate(user.createdAt)}
            t={t}
          />
        </motion.div>
      </div>

      {/* ── Security & Preferences ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/60 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
            {t('profile.securityPreferences')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Account Status */}
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-700/40 p-4">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              {t('profile.accountStatus')}
            </p>
            <div className="flex items-center gap-2">
              {(user.isActive === true || user.status === 'ACTIVE') ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span className={cn(
                'text-sm font-semibold',
                (user.isActive === true || user.status === 'ACTIVE')
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400',
              )}>
                {(user.isActive === true || user.status === 'ACTIVE') ? t('profile.accountActive') : t('profile.accountInactive')}
              </span>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-700/40 p-4">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              {t('profile.security')}
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                <Key className="w-4 h-4 shrink-0" />
                {t('profile.changePassword')}
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-700/40 p-4">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              {t('profile.preferences')}
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                <Bell className="w-4 h-4 shrink-0" />
                {t('profile.notifications')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <ProfileDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        user={user}
        onEdit={() => { setShowDetailModal(false); setShowFormModal(true); }}
      />
      <ProfileFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        user={user}
        onSuccess={handleProfileUpdate}
      />
      <NotificationPreferencesModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSave={handleSaveNotificationPreferences}
        initialPreferences={notificationPrefs || undefined}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};
