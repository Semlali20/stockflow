// frontend/src/pages/inventory/LotsPage.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, AlertCircle, Package, Download, Upload, FileText } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { ReportModal } from '@/components/ui/ReportModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';

const lotsReportColumns = [
  { header: 'Lot Number', key: 'lotNumber', width: 20 },
  { header: 'Code', key: 'code', width: 20 },
  { header: 'Item ID', key: 'itemId', width: 20 },
  { header: 'Manufacture Date', key: 'manufactureDate', width: 20 },
  { header: 'Expiry Date', key: 'expiryDate', width: 20 },
  { header: 'Status', key: 'status', width: 15 },
  { header: 'Created At', key: 'createdAt', width: 20 },
];

interface Lot {
  id: string;
  code: string;
  itemId: string;
  lotNumber: string;
  expiryDate?: string;
  manufactureDate?: string;
  supplierId?: string;
  status: string;
  attributes?: string;
  createdAt: string;
  updatedAt: string;
}

export const LotsPage: React.FC = () => {
  const { t } = useTranslation();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { isDownloading, downloadCsv } = useFileDownload();

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getLots();
      setLots(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(t('inventory.lots.messages.fetchError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedLot(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (lot: Lot) => {
    setSelectedLot(lot);
    setIsEditModalOpen(true);
  };

  const handleDelete = (lot: Lot) => {
    setSelectedLot(lot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLot) return;

    try {
      await inventoryService.deleteLot(selectedLot.id);
      toast.success(t('inventory.lots.messages.deleteSuccess'));
      fetchLots();
    } catch (error: any) {
      toast.error(t('inventory.lots.messages.deleteError'));
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedLot(null);
    }
  };

  const handleFormSuccess = () => {
    fetchLots();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedLot(null);
  };

  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      searchTerm === '' ||
      lot.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === '' || lot.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: lots.length,
    active: lots.filter((l) => l.status === 'ACTIVE').length,
    quarantined: lots.filter((l) => l.status === 'QUARANTINED').length,
    expired: lots.filter((l) => l.status === 'EXPIRED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('inventory.lots.title')}</h1>
          <p className="text-gray-600 mt-1">{t('inventory.lots.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={15} />}
            onClick={() => downloadCsv(API_ENDPOINTS.INVENTORY.LOTS_EXPORT_CSV, 'lots.csv')}
            loading={isDownloading}
          >
            {t('common.exportCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={15} />}
            onClick={() => setIsImportModalOpen(true)}
          >
            {t('common.importCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText size={15} />}
            onClick={() => setIsReportModalOpen(true)}
          >
            {t('common.report')}
          </Button>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            {t('inventory.lots.newLot')}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('inventory.lots.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
            <option value="">{t('inventory.filters.allStatuses')}</option>
            <option value="ACTIVE">{t('inventory.status.active')}</option>
            <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
            <option value="EXPIRED">{t('inventory.status.expired')}</option>
            <option value="RECALLED">{t('inventory.status.recalled')}</option>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.lots.stats.totalLots')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.lots.stats.active')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Calendar className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.lots.stats.quarantined')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.quarantined}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('inventory.lots.stats.expired')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.lots.table.code')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.lots.table.lotNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.lots.table.itemId')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.lots.table.manufacture')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.lots.table.expiry')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.status')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {t('inventory.lots.messages.noLots')}
                    </td>
                  </tr>
                ) : (
                  filteredLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lot.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lot.lotNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lot.itemId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lot.manufactureDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lot.expiryDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lot.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : lot.status === 'QUARANTINED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lot.status === 'EXPIRED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lot.status === 'ACTIVE' ? t('inventory.status.active') :
                           lot.status === 'QUARANTINED' ? t('inventory.status.quarantined') :
                           lot.status === 'EXPIRED' ? t('inventory.status.expired') :
                           lot.status === 'RECALLED' ? t('inventory.status.recalled') : lot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(lot)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={t('common.edit')}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(lot)}
                            className="text-red-600 hover:text-red-900"
                            title={t('common.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
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
      <LotFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedLot(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      {/* Edit Modal */}
      <LotFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLot(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        lot={selectedLot}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedLot(null);
        }}
        onConfirm={confirmDelete}
        title={t('inventory.lots.delete.title')}
        message={t('inventory.lots.delete.confirm', { number: selectedLot?.lotNumber || '' })}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => { fetchLots(); setIsImportModalOpen(false); }}
        title="Lots"
        importEndpoint={API_ENDPOINTS.INVENTORY.LOTS_IMPORT_CSV}
        templateColumns={['itemId', 'lotNumber', 'code', 'expiryDate', 'manufactureDate', 'supplierId', 'status', 'attributes']}
        exampleRows={[
          ['item-id-here', 'LOT001', 'CODE001', '2025-12-31', '2024-01-01', '', 'ACTIVE', ''],
        ]}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('inventory.lots.title')}
        description={t('inventory.lots.reportDescription')}
        columns={lotsReportColumns}
        fetchData={async () => {
          return lots as unknown as Record<string, unknown>[];
        }}
        filename="lots-report"
      />
    </div>
  );
};

// ============================================================================
// LOT FORM MODAL COMPONENT
// ============================================================================

interface LotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  lot?: Lot | null;
}

const LotFormModal: React.FC<LotFormModalProps> = ({ isOpen, onClose, onSuccess, mode, lot }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // Form data matching backend DTOs
  const [formData, setFormData] = useState({
    code: '',
    itemId: '',
    lotNumber: '',
    expiryDate: '',
    manufactureDate: '',
    supplierId: '',
    status: 'ACTIVE',
    attributes: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchItems();

      if (mode === 'edit' && lot) {
        // EDIT MODE
        setFormData({
          code: lot.code || '',
          itemId: lot.itemId || '',
          lotNumber: lot.lotNumber || '',
          expiryDate: lot.expiryDate || '',
          manufactureDate: lot.manufactureDate || '',
          supplierId: lot.supplierId || '',
          status: lot.status || 'ACTIVE',
          attributes: lot.attributes || '',
        });
      } else {
        // CREATE MODE
        setFormData({
          code: '',
          itemId: '',
          lotNumber: '',
          expiryDate: '',
          manufactureDate: '',
          supplierId: '',
          status: 'ACTIVE',
          attributes: '',
        });
      }
    }
  }, [isOpen, mode, lot]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      setItems(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error(t('inventory.messages.refDataError'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        // CREATE REQUEST - Match LotCreateRequest DTO
        const createRequest = {
          code: formData.code,
          itemId: formData.itemId,
          lotNumber: formData.lotNumber,
          expiryDate: formData.expiryDate || null,
          manufactureDate: formData.manufactureDate || null,
          supplierId: formData.supplierId || null,
          status: formData.status,
          attributes: formData.attributes || null,
        };

        await inventoryService.createLot(createRequest);
        toast.success(t('inventory.lots.messages.createSuccess'));
      } else {
        // UPDATE REQUEST - Match LotUpdateRequest DTO
        const updateRequest = {
          lotNumber: formData.lotNumber,
          expiryDate: formData.expiryDate || null,
          manufactureDate: formData.manufactureDate || null,
          supplierId: formData.supplierId || null,
          status: formData.status,
          attributes: formData.attributes || null,
        };

        await inventoryService.updateLot(lot!.id, updateRequest);
        toast.success(t('inventory.lots.messages.updateSuccess'));
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
            {mode === 'edit' ? t('inventory.lots.edit.title') : t('inventory.lots.newLot')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.lots.table.code')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                maxLength={100}
                placeholder="LOT-2024-001"
                disabled={mode === 'edit'}
              />
            </div>

            {/* Item - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.lots.table.itemId')} <span className="text-red-500">*</span>
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

            {/* Lot Number - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('inventory.lots.table.lotNumber')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                required
                maxLength={100}
                placeholder="BATCH-ABC-123"
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
                <option value="ACTIVE">{t('inventory.status.active')}</option>
                <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
                <option value="EXPIRED">{t('inventory.status.expired')}</option>
                <option value="RECALLED">{t('inventory.status.recalled')}</option>
              </Select>
            </div>

            {/* Manufacture Date - Optional, must be past */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.lots.table.manufacture')}</label>
              <Input
                type="date"
                value={formData.manufactureDate}
                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
              />
            </div>

            {/* Expiry Date - Optional, must be future */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.lots.table.expiry')}</label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            {/* Supplier ID - Optional */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.lots.table.supplier')}</label>
              <Input
                type="text"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                placeholder="Supplier UUID"
              />
            </div>

            {/* Attributes (JSON) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.lots.table.attributes')}</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.attributes}
                onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                rows={3}
                placeholder='{"temperature": "cold", "storage": "A1"}'
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : mode === 'edit' ? t('inventory.lots.edit.title') : t('inventory.lots.newLot')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};