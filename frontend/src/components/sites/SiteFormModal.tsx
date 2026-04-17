// src/components/sites/SiteFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  site?: any;
}

export const SiteFormModal: React.FC<SiteFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  site
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: 'WAREHOUSE' as 'WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'STORE' | 'MANUFACTURING' | 'PICKING' | 'STAGING' | 'SHIPPING' | 'QUARANTINE',
    timezone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && site) {
      setFormData({
        name: site.name || '',
        type: site.type || 'WAREHOUSE',
        timezone: site.timezone || '',
        address: site.address || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'WAREHOUSE',
        timezone: '',
        address: ''
      });
    }
  }, [mode, site, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        timezone: formData.timezone || null,
        address: formData.address || null
      };

      if (mode === 'create') {
        await locationService.createSite(payload);
        toast.success(t('locations.sites.createSuccess'));
      } else {
        await locationService.updateSite(site.id, payload);
        toast.success(t('locations.sites.updateSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving site:', error);
      toast.error(error?.response?.data?.message || t('locations.sites.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? t('locations.sites.create') : t('locations.sites.edit')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.name')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t('locations.sites.namePlaceholder')}
              />
            </div>

            {/* Type - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.type')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
              >
                <option value="WAREHOUSE">{t('locations.sites.types.warehouse')}</option>
                <option value="DISTRIBUTION_CENTER">{t('locations.sites.types.distributionCenter')}</option>
                <option value="STORE">{t('locations.sites.types.store')}</option>
                <option value="MANUFACTURING">{t('locations.sites.types.manufacturing')}</option>
                <option value="PICKING">{t('locations.sites.types.picking')}</option>
                <option value="STAGING">{t('locations.sites.types.staging')}</option>
                <option value="SHIPPING">{t('locations.sites.types.shipping')}</option>
                <option value="QUARANTINE">{t('locations.sites.types.quarantine')}</option>
              </Select>
            </div>
          </div>

          {/* Timezone - Optional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('locations.sites.timezone')}
            </label>
            <Select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            >
              <option value="">{t('locations.sites.selectTimezone')}</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Chicago">America/Chicago (CST/CDT)</option>
              <option value="America/Denver">America/Denver (MST/MDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="America/Phoenix">America/Phoenix (MST)</option>
              <option value="America/Anchorage">America/Anchorage (AKST/AKDT)</option>
              <option value="Pacific/Honolulu">Pacific/Honolulu (HST)</option>
              <option value="America/Toronto">America/Toronto (EST/EDT)</option>
              <option value="America/Vancouver">America/Vancouver (PST/PDT)</option>
              <option value="America/Mexico_City">America/Mexico_City (CST/CDT)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
              <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
              <option value="Europe/Madrid">Europe/Madrid (CET/CEST)</option>
              <option value="Europe/Rome">Europe/Rome (CET/CEST)</option>
              <option value="Europe/Amsterdam">Europe/Amsterdam (CET/CEST)</option>
              <option value="Europe/Brussels">Europe/Brussels (CET/CEST)</option>
              <option value="Europe/Warsaw">Europe/Warsaw (CET/CEST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
              <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEDT/AEST)</option>
              <option value="Australia/Melbourne">Australia/Melbourne (AEDT/AEST)</option>
              <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
              <option value="Pacific/Auckland">Pacific/Auckland (NZDT/NZST)</option>
            </Select>
          </div>

          {/* Address - Optional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.address')}
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('locations.sites.addressPlaceholder')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? t('common.saving') : mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};