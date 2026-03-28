// src/pages/products/ItemsPage.tsx

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, ChevronDown, FileText, Table, File } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { productService } from '@/services/product.service';
import { Item } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ItemFormModal } from '@/components/items/ItemFormModal';
import { ItemDetailModal } from '@/components/items/ItemDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ItemsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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

  // Fetch items and categories
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await productService.getItems();
      const itemsArray = Array.isArray(data) ? data : (data?.content || []);
      setItems(itemsArray);
      setFilteredItems(itemsArray);
    } catch (error) {
      toast.error(t('products.items.messages.fetchError'));
      console.error(error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data?.content || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item?.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory) {
      filtered = filtered.filter((item) => item.categoryId === filterCategory);
    }
    if (filterStatus) {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter((item) => item.isActive === isActive);
    }
    setFilteredItems(filtered);
  }, [searchTerm, filterCategory, filterStatus, items]);

  // ──────────────────────────────────────────────────────────────
  // EXPORT HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    setShowExportMenu(false);
    downloadCsv(API_ENDPOINTS.PRODUCTS.ITEMS_EXPORT_CSV, `items-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    try {
      const data = filteredItems.map((item) => ({
        SKU: item.sku || '',
        Name: item.name || '',
        Category: categories.find((c) => c.id === item.categoryId)?.name || '',
        Description: item.description || '',
        Serialized: item.isSerialized ? 'Yes' : 'No',
        'Lot Managed': item.isLotManaged ? 'Yes' : 'No',
        Status: item.isActive ? 'Active' : 'Inactive',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);

      // Auto-fit column widths
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row: any) => String(row[key] || '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Items');
      XLSX.writeFile(wb, `items-${new Date().toISOString().split('T')[0]}.xlsx`);
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

      // Decorative background shapes (left side)
      doc.setFillColor(154, 208, 170); doc.ellipse(8, 105, 22, 68, 'F');
      doc.setFillColor(140, 185, 225); doc.ellipse(18, 155, 18, 52, 'F');
      doc.setFillColor(200, 225, 150); doc.ellipse(5, 195, 14, 38, 'F');
      doc.setFillColor(154, 208, 170); doc.ellipse(10, 240, 10, 28, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(26, 58, 108);
      doc.text('ITEMS LIST', 14, 27);

      // Subtitle line
      doc.setFillColor(26, 58, 108);
      doc.rect(14, 31, 100, 1.2, 'F');

      // Date & count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${dateStr}`, 14, 40);
      doc.text(`Total items: ${filteredItems.length}`, 14, 47);

      // Table
      autoTable(doc, {
        startY: 55,
        head: [['SKU', 'Name', 'Category', 'Description', 'Serialized', 'Lot Mgd', 'Status']],
        body: filteredItems.map((item) => [
          item.sku || '',
          item.name || '',
          categories.find((c) => c.id === item.categoryId)?.name || '',
          item.description ? (item.description.length > 30 ? item.description.substring(0, 30) + '…' : item.description) : '',
          item.isSerialized ? 'Yes' : 'No',
          item.isLotManaged ? 'Yes' : 'No',
          item.isActive ? 'Active' : 'Inactive',
        ]),
        headStyles: {
          fillColor: [26, 58, 108],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 35 },
          2: { cellWidth: 28 },
          3: { cellWidth: 40 },
          4: { cellWidth: 18 },
          5: { cellWidth: 16 },
          6: { cellWidth: 18 },
        },
        margin: { left: 14, right: 14 },
      });

      // Footer
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

      doc.save(`items-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CRUD HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleCreate = () => { setSelectedItem(null); setIsCreateModalOpen(true); };
  const handleEdit = (item: Item) => { setSelectedItem(item); setIsEditModalOpen(true); };
  const handleView = (item: Item) => { setSelectedItem(item); setIsDetailModalOpen(true); };
  const handleDelete = (item: Item) => { setSelectedItem(item); setIsDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await productService.deleteItem(selectedItem.id);
      toast.success(t('products.items.messages.deleteSuccess'));
      fetchItems();
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(t('products.items.messages.deleteError'));
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchItems();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('products.items.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('products.items.subtitle')}</p>
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

          {/* Import CSV */}
          <Button
            variant="outline"
            size="sm"
            icon={<Upload size={15} />}
            onClick={() => setIsImportModalOpen(true)}
          >
            {t('common.import')}
          </Button>

          {/* New Item */}
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            {t('products.items.newItem')}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('products.items.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full">
            <option value="">{t('products.items.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full">
            <option value="">{t('products.items.allStatus')}</option>
            <option value="active">{t('products.items.statusActive')}</option>
            <option value="inactive">{t('products.items.statusInactive')}</option>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.sku')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('products.items.noItemsFound')}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">{item.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">
                          {categories.find((c) => c.id === item.categoryId)?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-200 max-w-xs truncate">
                          {item.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {item.isActive ? t('products.items.statusActive') : t('products.items.statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(item)} className="text-blue-600 hover:text-blue-900" title={t('common.view')}>
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEdit(item)} className="text-yellow-600 hover:text-yellow-900" title={t('common.edit')}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900" title={t('common.delete')}>
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

      {/* Modals */}
      <ItemFormModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedItem(null); }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <ItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedItem(null); }}
        onSuccess={handleFormSuccess}
        mode="edit"
        item={selectedItem}
      />

      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedItem(null); }}
        item={selectedItem}
        onEdit={() => { setIsDetailModalOpen(false); setIsEditModalOpen(true); }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedItem(null); }}
        onConfirm={confirmDelete}
        title={t('products.items.deleteTitle')}
        message={t('products.items.deleteConfirm', { name: selectedItem?.name || '' })}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => { fetchItems(); setIsImportModalOpen(false); }}
        title="Items"
        importEndpoint={API_ENDPOINTS.PRODUCTS.ITEMS_IMPORT_CSV}
        templateColumns={['sku', 'name', 'categoryId', 'description', 'tags', 'isSerialized', 'isLotManaged', 'shelfLifeDays', 'hazardousMaterial']}
        exampleRows={[
          ['SKU001', 'Sample Product', 'cat-id-here', 'Product description', 'electronics,new', 'false', 'false', '', 'false'],
        ]}
      />
    </div>
  );
};
