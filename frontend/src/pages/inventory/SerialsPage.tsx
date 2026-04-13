// frontend/src/pages/inventory/SerialsPage.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Hash } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { locationService } from '@/services/location.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface Serial {
  id: string;
  code: string;
  itemId: string;
  serialNumber: string;
  status: string;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export const SerialsPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedSerial, setSelectedSerial] = useState<Serial | null>(null);

  // Lookup maps
  const [itemNames, setItemNames] = useState<Map<string, string>>(new Map());
  const [locationCodes, setLocationCodes] = useState<Map<string, string>>(new Map());

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSerials();
    fetchItemNames();
    fetchLocationCodes();
  }, []);

  const fetchSerials = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getSerials();
      setSerials(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(t('inventory.serials.messages.fetchError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemNames = async () => {
    try {
      const response = await productService.getItems();
      const list: any[] = Array.isArray(response) ? response : response?.content || [];
      const map = new Map<string, string>();
      list.forEach((item: any) => map.set(item.id, item.name));
      setItemNames(map);
    } catch (error) {
      console.error('Failed to fetch items for name resolution:', error);
    }
  };

  const fetchLocationCodes = async () => {
    try {
      const response = await locationService.getLocations();
      const list: any[] = Array.isArray(response) ? response : response?.content || [];
      const map = new Map<string, string>();
      list.forEach((loc: any) => map.set(loc.id, loc.code || loc.name));
      setLocationCodes(map);
    } catch (error) {
      console.error('Failed to fetch locations for code resolution:', error);
    }
  };

  const handleCreate = () => {
    setSelectedSerial(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsEditModalOpen(true);
  };

  const handleDelete = (serial: Serial) => {
    setSelectedSerial(serial);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSerial) return;

    try {
      await inventoryService.deleteSerial(selectedSerial.id);
      toast.success(t('inventory.serials.messages.deleteSuccess'));
      fetchSerials();
    } catch (error: any) {
      toast.error(t('inventory.serials.messages.deleteError'));
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSerial(null);
    }
  };

  const handleFormSuccess = () => {
    fetchSerials();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSerial(null);
  };

  const filteredSerials = serials.filter((serial) => {
    const matchesSearch =
      searchTerm === '' ||
      serial.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serial.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || serial.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: serials.length,
    inStock: serials.filter((s) => s.status === 'IN_STOCK').length,
    sold: serials.filter((s) => s.status === 'SOLD').length,
    defective: serials.filter((s) => s.status === 'DEFECTIVE').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('inventory.serials.title')}</h1>
          <p className="text-gray-600 mt-1">{t('inventory.serials.subtitle')}</p>
        </div>
        {hasPermission(PERMISSIONS.SERIALS_CREATE) && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            {t('inventory.serials.newSerial')}
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('inventory.serials.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
            <option value="">{t('inventory.filters.allStatuses')}</option>
            <option value="IN_STOCK">{t('inventory.serials.status.inStock')}</option>
            <option value="SOLD">{t('inventory.serials.status.sold')}</option>
            <option value="DEFECTIVE">{t('inventory.serials.status.defective')}</option>
            <option value="RETURNING">{t('inventory.serials.status.returning')}</option>
            <option value="SCRAPPED">{t('inventory.serials.status.scrapped')}</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.serials.stats.totalSerials')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Hash className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.serials.status.inStock')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <Hash className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.serials.status.sold')}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
            </div>
            <Hash className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.serials.status.defective')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.defective}</p>
            </div>
            <Hash className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.serials.table.code')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.serials.table.serialNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.serials.table.itemId')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.serials.table.location')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.status')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSerials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('inventory.serials.messages.noSerials')}
                    </td>
                  </tr>
                ) : (
                  filteredSerials.map((serial) => (
                    <tr key={serial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{serial.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                        {serial.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {itemNames.get(serial.itemId) || serial.itemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {serial.locationId ? (locationCodes.get(serial.locationId) || serial.locationId) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            serial.status === 'IN_STOCK'
                              ? 'bg-green-100 text-green-800'
                              : serial.status === 'SOLD'
                              ? 'bg-blue-100 text-blue-800'
                              : serial.status === 'DEFECTIVE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {serial.status === 'IN_STOCK' ? t('inventory.serials.status.inStock') :
                           serial.status === 'SOLD' ? t('inventory.serials.status.sold') :
                           serial.status === 'DEFECTIVE' ? t('inventory.serials.status.defective') :
                           serial.status === 'RETURNING' ? t('inventory.serials.status.returning') :
                           serial.status === 'SCRAPPED' ? t('inventory.serials.status.scrapped') : serial.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {hasPermission(PERMISSIONS.SERIALS_EDIT) && (
                            <button
                              onClick={() => handleEdit(serial)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title={t('common.edit')}
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.SERIALS_DELETE) && (
                            <button
                              onClick={() => handleDelete(serial)}
                              className="text-red-600 hover:text-red-900"
                              title={t('common.delete')}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <SerialFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSerial(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      {/* Edit Modal */}
      <SerialFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSerial(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        serial={selectedSerial}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSerial(null);
        }}
        onConfirm={confirmDelete}
        title={t('inventory.serials.delete.title')}
        message={t('inventory.serials.delete.confirm', { number: selectedSerial?.serialNumber || '' })}
      />
    </div>
  );
};

// ============================================================================
// SERIAL FORM MODAL COMPONENT
// ============================================================================

interface SerialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  serial?: Serial | null;
}

const SerialFormModal: React.FC<SerialFormModalProps> = ({ isOpen, onClose, onSuccess, mode, serial }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Form data matching backend DTOs
  const [formData, setFormData] = useState({
    itemId: '',
    code: '',
    serialNumber: '',
    status: 'IN_STOCK',
    locationId: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchLocations();

      if (mode === 'edit' && serial) {
        // EDIT MODE
        setFormData({
          itemId: serial.itemId || '',
          code: serial.code || '',
          serialNumber: serial.serialNumber || '',
          status: serial.status || 'IN_STOCK',
          locationId: serial.locationId || '',
        });
      } else {
        // CREATE MODE
        setFormData({
          itemId: '',
          code: '',
          serialNumber: '',
          status: 'IN_STOCK',
          locationId: '',
        });
      }
    }
  }, [isOpen, mode, serial]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error(t('inventory.messages.refDataError'));
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      setLocations(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error(t('inventory.messages.refDataError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        // CREATE REQUEST - Match SerialCreateRequest DTO
        const createRequest = {
          itemId: formData.itemId,
          code: formData.code,
          serialNumber: formData.serialNumber,
          status: formData.status,
          locationId: formData.locationId || null,
        };

        await inventoryService.createSerial(createRequest);
        toast.success(t('inventory.serials.messages.createSuccess'));
      } else {
        // UPDATE REQUEST - Match SerialUpdateRequest DTO
        const updateRequest = {
          serialNumber: formData.serialNumber,
          locationId: formData.locationId || null,
          status: formData.status,
        };

        await inventoryService.updateSerial(serial!.id, updateRequest);
        toast.success(t('inventory.serials.messages.updateSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? t('inventory.serials.edit.title') : t('inventory.serials.newSerial')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.serials.table.itemId')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                required
                disabled={mode === 'edit'}
              >
                <option value="">{t('common.selectItem')}</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </Select>
            </div>

            {/* Code - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.serials.table.code')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                maxLength={100}
                placeholder="SN-2024-001"
                disabled={mode === 'edit'}
              />
            </div>

            {/* Serial Number - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.serials.table.serialNumber')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
                maxLength={100}
                placeholder="ABC123XYZ789"
              />
            </div>

            {/* Status - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.table.status')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="IN_STOCK">{t('inventory.serials.status.inStock')}</option>
                <option value="SOLD">{t('inventory.serials.status.sold')}</option>
                <option value="DEFECTIVE">{t('inventory.serials.status.defective')}</option>
                <option value="RETURNING">{t('inventory.serials.status.returning')}</option>
                <option value="SCRAPPED">{t('inventory.serials.status.scrapped')}</option>
              </Select>
            </div>

            {/* Location - Optional */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.serials.table.location')}</label>
              <Select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              >
                <option value="">{t('common.noLocation')}</option>
                {locations.filter(loc => loc?.id).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code || loc.name || loc.id}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : mode === 'edit' ? t('inventory.serials.edit.title') : t('inventory.serials.newSerial')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};