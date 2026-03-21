// src/components/locations/LocationFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
    coordinates: ''
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
        coordinates: location.coordinates || ''
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
        coordinates: ''
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
        coordinates: formData.coordinates || null
      };

      if (mode === 'create') {
        await locationService.createLocation(payload);
        toast.success('Location created successfully');
      } else {
        await locationService.updateLocation(location.id, payload);
        toast.success('Location updated successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error?.response?.data?.message || `Failed to ${mode} location`);
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
            {mode === 'create' ? 'Create Location' : 'Edit Location'}
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
                Warehouse <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                required
                disabled={loadingWarehouses}
              >
                <option value="">
                  {loadingWarehouses ? 'Loading warehouses...' : 'Select a warehouse'}
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
                Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="e.g., A-01-01-01"
              />
              <p className="text-xs text-gray-500 mt-1">Unique within warehouse</p>
            </div>
          </div>

          {/* Type - Required */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
            >
              <option value="RECEIVING">Receiving</option>
              <option value="STORAGE">Storage</option>
              <option value="PICKING">Picking</option>
              <option value="STAGING">Staging</option>
              <option value="SHIPPING">Shipping</option>
              <option value="QUARANTINE">Quarantine</option>
              <option value="MANUFACTURING">Manufacturing</option>
              <option value="RETURNS">Returns</option>
            </Select>
          </div>

          {/* Location Coordinates */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location Structure
            </label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <Input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Zone (A)"
                />
                <p className="text-xs text-gray-500 mt-1">Zone</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.aisle}
                  onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">Aisle</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.rack}
                  onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">Rack</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">Level</p>
              </div>
              <div>
                <Input
                  type="text"
                  value={formData.bin}
                  onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="01"
                />
                <p className="text-xs text-gray-500 mt-1">Bin</p>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <Input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 100 pallets, 500 boxes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coordinates</label>
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
            <label className="block text-sm font-medium mb-2">Restrictions</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[60px]"
              value={formData.restrictions}
              onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
              placeholder="Any special restrictions or requirements (e.g., Hazmat only, Temperature controlled, etc.)"
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingWarehouses}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};