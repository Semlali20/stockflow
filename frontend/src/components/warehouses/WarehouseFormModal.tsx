// src/components/warehouses/WarehouseFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  warehouse?: any;
}

interface SettingItem {
  key: string;
  value: string;
}

export const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  warehouse
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    siteId: '',
    name: '',
    code: '',
    address: '',
    isActive: true
  });
  
  // Easy settings - array of key-value pairs
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [siteSearch, setSiteSearch] = useState('');
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const siteDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch sites for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(e.target as Node)) {
        setSiteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSites();
    }
  }, [isOpen]);

  const fetchSites = async () => {
    setLoadingSites(true);
    try {
      const data = await locationService.getSites();
      setSites(Array.isArray(data) ? data : (data?.content || []));
    } catch (error) {
      console.error('Failed to fetch sites:', error);
      toast.error('Failed to load sites');
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && warehouse) {
      setFormData({
        siteId: warehouse.siteId || '',
        name: warehouse.name || '',
        code: warehouse.code || '',
        address: warehouse.address || '',
        isActive: warehouse.isActive !== false
      });

      // Parse JSON string settings from backend to array
      if (warehouse.settings) {
        try {
          const parsedSettings = JSON.parse(warehouse.settings);
          const settingsArray = Object.entries(parsedSettings).map(([key, value]) => ({
            key,
            value: String(value)
          }));
          setSettings(settingsArray);
        } catch (e) {
          console.error('Failed to parse settings:', e);
          setSettings([]);
        }
      } else {
        setSettings([]);
      }
    } else {
      setFormData({
        siteId: '',
        name: '',
        code: '',
        address: '',
        isActive: true
      });
      setSettings([]);
    }
  }, [mode, warehouse, isOpen]);

  // Add new setting row
  const handleAddSetting = () => {
    setSettings([...settings, { key: '', value: '' }]);
  };

  // Remove setting row
  const handleRemoveSetting = (index: number) => {
    setSettings(settings.filter((_, i) => i !== index));
  };

  // Update setting key or value
  const handleSettingChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSettings = [...settings];
    newSettings[index][field] = value;
    setSettings(newSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert settings array to JSON object then to string
      let settingsJson = null;
      if (settings.length > 0) {
        const settingsObject: Record<string, string> = {};
        settings.forEach(item => {
          if (item.key.trim()) { // Only add if key is not empty
            settingsObject[item.key.trim()] = item.value;
          }
        });
        // Convert to JSON string for backend: "{\"key\":\"value\"}"
        settingsJson = JSON.stringify(settingsObject);
      }

      const payload = {
        siteId: formData.siteId,
        name: formData.name,
        code: formData.code,
        address: formData.address || undefined,
        isActive: formData.isActive,
        settings: settingsJson // Send as JSON string
      };

      if (mode === 'create') {
        await locationService.createWarehouse(payload);
        toast.success(t('locations.warehouses.createSuccess'));
      } else {
        await locationService.updateWarehouse(warehouse.id, payload);
        toast.success(t('locations.warehouses.updateSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving warehouse:', error);
      toast.error(error?.response?.data?.message || t('locations.warehouses.saveFailed'));
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
            {mode === 'create' ? t('locations.warehouses.create') : t('locations.warehouses.edit')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Site - Required */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.site')} <span className="text-red-500">*</span>
            </label>
            <div ref={siteDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => { if (!loadingSites) { setSiteDropdownOpen(o => !o); setSiteSearch(''); } }}
                disabled={loadingSites}
                className={`w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingSites ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className={formData.siteId ? '' : 'text-gray-400 dark:text-gray-500'}>
                  {loadingSites
                    ? t('locations.warehouses.loadingSites')
                    : formData.siteId
                      ? sites.find(s => s.id === formData.siteId)?.name ?? t('locations.warehouses.selectSite')
                      : t('locations.warehouses.selectSite')}
                </span>
                <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${siteDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {siteDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={siteSearch}
                        onChange={e => setSiteSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {sites
                      .filter(s => s.name.toLowerCase().includes(siteSearch.toLowerCase()))
                      .map(site => (
                        <li
                          key={site.id}
                          onClick={() => { setFormData({ ...formData, siteId: site.id }); setSiteDropdownOpen(false); }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                            formData.siteId === site.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {site.name}
                        </li>
                      ))}
                    {sites.filter(s => s.name.toLowerCase().includes(siteSearch.toLowerCase())).length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

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
                placeholder={t('locations.warehouses.namePlaceholder')}
              />
            </div>

            {/* Code - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('common.code')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder={t('locations.warehouses.codePlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{t('locations.warehouses.codeUnique')}</p>
            </div>
          </div>

          {/* Address - Optional */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('locations.warehouses.addressOptional')}
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('locations.warehouses.addressPlaceholder')}
            />
          </div>

          {/* Active / Inactive Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('common.status')}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formData.isActive ? t('locations.warehouses.statusDescription') : t('common.inactive')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                formData.isActive ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Settings - Easy Key-Value Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                {t('locations.warehouses.settingsOptional')}
              </label>
              <Button
                type="button"
                onClick={handleAddSetting}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                {t('locations.warehouses.addSetting')}
              </Button>
            </div>

            {settings.length === 0 ? (
              <div className="border rounded p-4 text-center text-gray-500 text-sm">
                {t('locations.warehouses.noSettings')}
              </div>
            ) : (
              <div className="border rounded p-3 space-y-2">
                {settings.map((setting, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Key (e.g., capacity, manager)"
                      value={setting.key}
                      onChange={(e) => handleSettingChange(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-gray-400">:</span>
                    <Input
                      type="text"
                      placeholder="Value (e.g., 10000, John Doe)"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSetting(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {t('locations.warehouses.commonSettings')}
            </p>
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
              disabled={loading || loadingSites}
            >
              {loading ? t('common.saving') : mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};