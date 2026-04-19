// frontend/src/pages/inventory/LotsPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, AlertCircle, Package, Download, Upload, ChevronDown, FileText, Table, File } from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { inventoryService } from '@/services/inventory.service';
import { productService } from '@/services/product.service';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import { Pagination } from '@/components/ui/Pagination';

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
  const { hasPermission } = usePermissions();
  const [lots, setLots] = useState<Lot[]>([]);
  const [items, setItems] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { isDownloading, downloadCsv } = useFileDownload();

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchLots();
    fetchItems();
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

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      const arr = Array.isArray(response) ? response : response?.content || [];
      setItems(new Map(arr.map((item: any) => [item.id, item])));
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // EXPORT HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    setShowExportMenu(false);
    downloadCsv(API_ENDPOINTS.INVENTORY.LOTS_EXPORT_CSV, `lots-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    try {
      const data = filteredLots.map((lot) => ({
        'Code': lot.code,
        'Lot Number': lot.lotNumber,
        'Item': items.get(lot.itemId)?.name || lot.itemId,
        'SKU': items.get(lot.itemId)?.sku || '',
        'Manufacture Date': lot.manufactureDate || '',
        'Expiry Date': lot.expiryDate || '',
        'Status': lot.status,
        'Supplier ID': lot.supplierId || '',
        'Created At': lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row: any) => String(row[key] ?? '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lots');
      XLSX.writeFile(wb, `lots-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel file');
    }
  };

  const handleExportPDF = () => {
    setShowExportMenu(false);
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

      // Decorative background shapes
      doc.setFillColor(154, 208, 170); doc.ellipse(8, 105, 22, 68, 'F');
      doc.setFillColor(140, 185, 225); doc.ellipse(18, 155, 18, 52, 'F');
      doc.setFillColor(200, 225, 150); doc.ellipse(5, 195, 14, 38, 'F');
      doc.setFillColor(154, 208, 170); doc.ellipse(10, 240, 10, 28, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(26, 58, 108);
      doc.text('LOTS', 14, 27);

      doc.setFillColor(26, 58, 108);
      doc.rect(14, 31, 60, 1.2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${dateStr}`, 14, 40);
      doc.text(`Total lots: ${filteredLots.length}`, 14, 47);

      autoTable(doc, {
        startY: 55,
        head: [['Code', 'Lot Number', 'Item', 'Manufacture', 'Expiry', 'Status']],
        body: filteredLots.map((lot) => [
          lot.code,
          lot.lotNumber,
          items.get(lot.itemId)?.name || lot.itemId,
          lot.manufactureDate || '—',
          lot.expiryDate || '—',
          lot.status,
        ]),
        headStyles: { fillColor: [26, 58, 108], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 28 },
          4: { cellWidth: 28 },
          5: { cellWidth: 22 },
        },
        margin: { left: 14, right: 14 },
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(26, 58, 108);
        doc.rect(0, pageH - 14, doc.internal.pageSize.getWidth(), 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Stock Management System', 14, pageH - 5);
        doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.getWidth() - 30, pageH - 5);
      }

      const pdfUrl = doc.output('bloburl');
      window.open(pdfUrl, '_blank');
      toast.success('PDF opened in new tab');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CRUD HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleCreate = () => { setSelectedLot(null); setIsCreateModalOpen(true); };
  const handleEdit = (lot: Lot) => { setSelectedLot(lot); setIsEditModalOpen(true); };
  const handleDelete = (lot: Lot) => { setSelectedLot(lot); setIsDeleteDialogOpen(true); };

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

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('inventory.lots.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('inventory.lots.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">

          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={15} />}
              onClick={() => setShowExportMenu((v) => !v)}
              loading={isDownloading}
              className="flex items-center gap-1"
            >
              {t('common.export')}
              <ChevronDown size={13} className={`ml-0.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <FileText size={15} className="text-green-600" />
                  CSV File (.csv)
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Table size={15} className="text-emerald-600" />
                  Excel File (.xlsx)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <File size={15} className="text-red-500" />
                  PDF Document (.pdf)
                </button>
              </div>
            )}
          </div>

          {/* Import */}
          {hasPermission(PERMISSIONS.LOTS_CREATE) && (
            <Button variant="outline" size="sm" icon={<Upload size={15} />} onClick={() => setIsImportModalOpen(true)}>
              {t('common.import')}
            </Button>
          )}

          {/* New Lot */}
          {hasPermission(PERMISSIONS.LOTS_CREATE) && (
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus size={20} />
              {t('inventory.lots.newLot')}
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 mb-6">
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
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.lots.stats.totalLots')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.lots.stats.active')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Calendar className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.lots.stats.quarantined')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.quarantined}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('inventory.lots.stats.expired')}</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <AlertCircle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.lots.table.code')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.lots.table.lotNumber')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.lots.table.itemId')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.lots.table.manufacture')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.lots.table.expiry')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.table.status')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('inventory.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredLots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('inventory.lots.messages.noLots')}
                    </td>
                  </tr>
                ) : (
                  filteredLots.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lot.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{lot.lotNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {items.get(lot.itemId)?.name || lot.itemId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lot.manufactureDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lot.expiryDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lot.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          lot.status === 'QUARANTINED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          lot.status === 'EXPIRED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {lot.status === 'ACTIVE' ? t('inventory.status.active') :
                           lot.status === 'QUARANTINED' ? t('inventory.status.quarantined') :
                           lot.status === 'EXPIRED' ? t('inventory.status.expired') :
                           lot.status === 'RECALLED' ? t('inventory.status.recalled') : lot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {hasPermission(PERMISSIONS.LOTS_EDIT) && (
                            <button onClick={() => handleEdit(lot)} className="text-yellow-600 hover:text-yellow-900" title={t('common.edit')}>
                              <Edit size={18} />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.LOTS_DELETE) && (
                            <button onClick={() => handleDelete(lot)} className="text-red-600 hover:text-red-900" title={t('common.delete')}>
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
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredLots.length / pageSize)}
            totalItems={filteredLots.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
          </>
        )}
      </div>

      {/* Create Modal */}
      <LotFormModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedLot(null); }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      {/* Edit Modal */}
      <LotFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedLot(null); }}
        onSuccess={handleFormSuccess}
        mode="edit"
        lot={selectedLot}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedLot(null); }}
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
  const [itemSearch, setItemSearch] = useState('');
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const itemDropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target as Node)) {
        setItemDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      if (mode === 'edit' && lot) {
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
        setFormData({ code: '', itemId: '', lotNumber: '', expiryDate: '', manufactureDate: '', supplierId: '', status: 'ACTIVE', attributes: '' });
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
        await inventoryService.createLot({
          code: formData.code,
          itemId: formData.itemId,
          lotNumber: formData.lotNumber,
          expiryDate: formData.expiryDate || null,
          manufactureDate: formData.manufactureDate || null,
          supplierId: formData.supplierId || null,
          status: formData.status,
          attributes: formData.attributes || null,
        });
        toast.success(t('inventory.lots.messages.createSuccess'));
      } else {
        await inventoryService.updateLot(lot!.id, {
          lotNumber: formData.lotNumber,
          expiryDate: formData.expiryDate || null,
          manufactureDate: formData.manufactureDate || null,
          supplierId: formData.supplierId || null,
          status: formData.status,
          attributes: formData.attributes || null,
        });
        toast.success(t('inventory.lots.messages.updateSuccess'));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? t('inventory.lots.edit.title') : t('inventory.lots.newLot')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.lots.table.code')} <span className="text-red-500">*</span>
              </label>
              <Input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required maxLength={100} placeholder="LOT-2024-001" disabled={mode === 'edit'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.lots.table.itemId')} <span className="text-red-500">*</span>
              </label>
              <div ref={itemDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { if (mode !== 'edit') { setItemDropdownOpen(o => !o); setItemSearch(''); } }}
                  disabled={mode === 'edit'}
                  className={`w-full flex items-center justify-between border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${mode === 'edit' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={formData.itemId ? '' : 'text-gray-400 dark:text-gray-500'}>
                    {formData.itemId
                      ? (() => { const i = items.find(x => x.id === formData.itemId); return i ? `${i.name} (${i.sku})` : t('common.selectItem'); })()
                      : t('common.selectItem')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${itemDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {itemDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 dark:border-neutral-700">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          value={itemSearch}
                          onChange={e => setItemSearch(e.target.value)}
                          placeholder={`${t('common.search')}...`}
                          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                      {items
                        .filter(i => `${i.name} ${i.sku}`.toLowerCase().includes(itemSearch.toLowerCase()))
                        .map(item => (
                          <li
                            key={item.id}
                            onClick={() => { setFormData({ ...formData, itemId: item.id }); setItemDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              formData.itemId === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {item.name} <span className="text-gray-400 dark:text-gray-500">({item.sku})</span>
                          </li>
                        ))}
                      {items.filter(i => `${i.name} ${i.sku}`.toLowerCase().includes(itemSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.lots.table.lotNumber')} <span className="text-red-500">*</span>
              </label>
              <Input type="text" value={formData.lotNumber} onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                required maxLength={100} placeholder="BATCH-ABC-123" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inventory.table.status')} <span className="text-red-500">*</span>
              </label>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
                <option value="ACTIVE">{t('inventory.status.active')}</option>
                <option value="QUARANTINED">{t('inventory.status.quarantined')}</option>
                <option value="EXPIRED">{t('inventory.status.expired')}</option>
                <option value="RECALLED">{t('inventory.status.recalled')}</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.lots.table.manufacture')}</label>
              <Input type="date" value={formData.manufactureDate} onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.lots.table.expiry')}</label>
              <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.lots.table.supplier')}</label>
              <Input type="text" value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} placeholder="Supplier UUID" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.lots.table.attributes')}</label>
              <textarea
                className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                value={formData.attributes}
                onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                rows={3}
                placeholder='{"temperature": "cold", "storage": "A1"}'
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t dark:border-neutral-700">
            <Button type="button" onClick={onClose} variant="outline" disabled={loading}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : mode === 'edit' ? t('inventory.lots.edit.title') : t('inventory.lots.newLot')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
