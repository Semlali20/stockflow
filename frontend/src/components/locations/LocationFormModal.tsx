// src/components/locations/LocationFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  location?: any;
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  location
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    warehouseId: '',
    code: '',
    zone: '',
    aisle: '',
    rack: '',
    level: '',
    bin: '',
    type: 'STORAGE' as 'RECEIVING' | 'STORAGE' | 'PICKING' | 'STAGING' | 'SHIPPING' | 'QUARANTINE' | 'MANUFACTURING' | 'RETURNS',
    capacity: '',
    restrictions: '',
    coordinates: '',
    isActive: true
  });
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Fetch warehouses for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
    }
  }, [isOpen]);

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const data = await locationService.getWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      toast.error('Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && location) {
      setFormData({
        warehouseId: location.warehouseId || '',
        code: location.code || '',
        zone: location.zone || '',
        aisle: location.aisle || '',
        rack: location.rack || '',
        level: location.level || '',
        bin: location.bin || '',
        type: location.type || 'STORAGE',
        capacity: location.capacity || '',
        restrictions: location.restrictions || '',
        coordinates: location.coordinates || '',
        isActive: location.isActive !== false
      });
    } else {
      setFormData({
        warehouseId: '',
        code: '',
        zone: '',
        aisle: '',
        rack: '',
        level: '',
        bin: '',
        type: 'STORAGE',
        capacity: '',
        restrictions: '',
        coordinates: '',
        isActive: true
      });
    }
  }, [mode, location, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        warehouseId: formData.warehouseId,
        code: formData.code,
        zone: formData.zone || null,
        aisle: formData.aisle || null,
        rack: formData.rack || null,
        level: formData.level || null,
        bin: formData.bin || null,
        type: formData.type,
        capacity: formData.capacity || null,
        restrictions: formData.restrictions || null,
        coordinates: formData.coordinates || null,
        isActive: formData.isActive
      };

      if (mode === 'create') {
        await locationService.createLocation(payload);
        toast.success(t('locations.locations.createSuccess'));
      } else {
        await locationService.updateLocation(location.id, payload);
        toast.success(t('locations.locations.updateSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error?.response?.data?.message || t('locations.locations.saveFailed'));
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
            {mode === 'create' ? t('locations.locations.create') : t('locations.locations.edit')}
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
            {/* Warehouse - Required */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('nav.warehouses')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                required
                disabled={loadingWarehouses}
              >
                <option value="">
                  {loadingWarehouses ? t('locations.locations.loadingWarehouses') : t('locations.locations.selectWarehouse')}
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </Select>
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
                placeholder={t('locations.locations.codePlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{t('locations.locations.codeUnique')}</p>
            </div>
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
              <option value="RECEIVING">{t('locations.locations.types.receiving')}</option>
              <option value="STORAGE">{t('locations.locations.types.storage')}</option>
              <option value="PICKING">{t('locations.locations.types.picking')}</option>
              <option value="STAGING">{t('locations.locations.types.staging')}</option>
              <option value="SHIPPING">{t('locations.locations.types.shipping')}</option>
              <option value="QUARANTINE">{t('locations.locations.types.quarantine')}</option>
              <option value="MANUFACTURING">{t('locations.sites.types.manufacturing')}</option>
              <option value="RETURNS">{t('locations.locations.types.returns')}</option>
            </Select>
          </div>

          {/* Location Coordinates */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('locations.locations.structure')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <Input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Zone (A)"
                />
                <p className="text-xs text-gray-500 mt-1">{t('locations.locations.zone')}</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.aisle}
                  onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">{t('locations.locations.aisle')}</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.rack}
                  onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">{t('locations.locations.rack')}</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">{t('locations.locations.level')}</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.bin}
                  onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">{t('locations.locations.bin')}</p>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('locations.locations.capacity')}</label>
              <Input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 100 pallets, 500 boxes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('locations.locations.coordinates')}</label>
              <Input
                type="text"
                value={formData.coordinates}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                placeholder="e.g., X:10 Y:20, GPS:lat,long"
              />
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('locations.locations.restrictions')}</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[60px]"
              value={formData.restrictions}
              onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
              placeholder="Any special restrictions or requirements (e.g., Hazmat only, Temperature controlled, etc.)"
            />
          </div>

          {/* Active / Inactive Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('common.status')}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formData.isActive ? t('locations.locations.statusDescription') : t('common.inactive')}
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
              disabled={loading || loadingWarehouses}
            >
              {loading ? t('common.saving') : mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};