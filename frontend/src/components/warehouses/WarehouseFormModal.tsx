// src/components/warehouses/WarehouseFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
  const [formData, setFormData] = useState({
    siteId: '',
    name: '',
    code: ''
  });
  
  // Easy settings - array of key-value pairs
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);

  // Fetch sites for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchSites();
    }
  }, [isOpen]);

  const fetchSites = async () => {
    setLoadingSites(true);
    try {
      const data = await locationService.getSites();
      setSites(Array.isArray(data) ? data : []);
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
        code: warehouse.code || ''
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
        code: ''
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
        settings: settingsJson // Send as JSON string
      };

      if (mode === 'create') {
        await locationService.createWarehouse(payload);
        toast.success('Warehouse created successfully');
      } else {
        await locationService.updateWarehouse(warehouse.id, payload);
        toast.success('Warehouse updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving warehouse:', error);
      toast.error(error?.response?.data?.message || `Failed to ${mode} warehouse`);
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
            {mode === 'create' ? 'Create Warehouse' : 'Edit Warehouse'}
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
              Site <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              required
              disabled={loadingSites}
            >
              <option value="">
                {loadingSites ? 'Loading sites...' : 'Select a site'}
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Name - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter warehouse name"
              />
            </div>

            {/* Code - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., WH-001"
              />
              <p className="text-xs text-gray-500 mt-1">Must be unique</p>
            </div>
          </div>

          {/* Settings - Easy Key-Value Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Settings (Optional)
              </label>
              <Button
                type="button"
                onClick={handleAddSetting}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                Add Setting
              </Button>
            </div>
            
            {settings.length === 0 ? (
              <div className="border rounded p-4 text-center text-gray-500 text-sm">
                No settings added. Click "Add Setting" to add configuration options like capacity, manager, contact info, etc.
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
              Common settings: capacity, manager, phone, email, operating_hours, etc.
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingSites}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};