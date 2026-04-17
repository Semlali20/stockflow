import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Bell, Mail, Smartphone, Clock, AlertTriangle, Package, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  lowStockAlerts: boolean;
  qualityAlerts: boolean;
  movementAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  initialPreferences?: NotificationPreferences;
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  inAppNotifications: true,
  lowStockAlerts: true,
  qualityAlerts: true,
  movementAlerts: false,
  dailyReports: false,
  weeklyReports: true,
  notificationFrequency: 'immediate',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences
}) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || defaultPreferences
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialPreferences) {
      setPreferences(initialPreferences);
    }
  }, [isOpen, initialPreferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(preferences);
      toast.success(t('profile.modals.saveSuccess'));
      onClose();
    } catch (error: any) {
      toast.error(error?.message || t('profile.modals.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Bell className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('profile.modals.notificationTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notification Channels */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-indigo-600" />
              {t('profile.modals.channels')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{t('profile.modals.emailNotifications')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{t('profile.modals.inAppNotifications')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={() => handleToggle('inAppNotifications')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Alert Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-600" />
              {t('profile.modals.alertTypes')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="text-gray-900 dark:text-white">{t('profile.modals.lowStockAlerts')}</div>
                    <div className="text-sm text-gray-500">{t('profile.modals.lowStockDesc')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.lowStockAlerts}
                  onChange={() => handleToggle('lowStockAlerts')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="text-gray-900 dark:text-white">{t('profile.modals.qualityAlerts')}</div>
                    <div className="text-sm text-gray-500">{t('profile.modals.qualityDesc')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.qualityAlerts}
                  onChange={() => handleToggle('qualityAlerts')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="text-gray-900 dark:text-white">{t('profile.modals.movementAlerts')}</div>
                    <div className="text-sm text-gray-500">{t('profile.modals.movementDesc')}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.movementAlerts}
                  onChange={() => handleToggle('movementAlerts')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Reports */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail size={18} className="text-blue-600" />
              {t('profile.modals.emailReports')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <span className="text-gray-900 dark:text-white">{t('profile.modals.dailyReports')}</span>
                <input
                  type="checkbox"
                  checked={preferences.dailyReports}
                  onChange={() => handleToggle('dailyReports')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                <span className="text-gray-900 dark:text-white">{t('profile.modals.weeklyReports')}</span>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReports}
                  onChange={() => handleToggle('weeklyReports')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('profile.modals.frequency')}
            </h3>
            <select
              value={preferences.notificationFrequency}
              onChange={(e) => handleChange('notificationFrequency', e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="immediate">{t('profile.modals.immediate')}</option>
              <option value="daily">{t('profile.modals.dailyDigest')}</option>
              <option value="weekly">{t('profile.modals.weeklyDigest')}</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              {t('profile.modals.quietHours')}
            </h3>
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={preferences.quietHoursEnabled}
                onChange={() => handleToggle('quietHoursEnabled')}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-900 dark:text-white">{t('profile.modals.quietHoursEnable')}</span>
            </label>

            {preferences.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('profile.modals.startTime')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('profile.modals.endTime')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            {t('profile.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? t('common.saving') : t('profile.modals.savePrefs')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
