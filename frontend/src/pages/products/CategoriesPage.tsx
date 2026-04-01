// src/pages/products/CategoriesPage.tsx

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, ChevronDown, FileText, Table, File } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { productService } from '@/services/product.service';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

export const CategoriesPage = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await productService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data?.content || []);
      setCategories(categoriesArray);
      setFilteredCategories(categoriesArray);
    } catch (error) {
      toast.error(t('products.categories.messages.fetchError'));
      console.error(error);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  // ──────────────────────────────────────────────────────────────
  // EXPORT HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleExportCSV = () => {
    setShowExportMenu(false);
    downloadCsv(API_ENDPOINTS.PRODUCTS.CATEGORIES_EXPORT_CSV, `categories-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    try {
      const data = filteredCategories.map((cat) => ({
        Name: cat.name || '',
        Description: cat.description || '',
        'Parent Category': cat.parentCategoryId
          ? categories.find((c) => c.id === cat.parentCategoryId)?.name || cat.parentCategoryId
          : '',
        Status: cat.isActive ? 'Active' : 'Inactive',
        'Created At': cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '',
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row: any) => String(row[key] || '').length)) + 2,
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Categories');
      XLSX.writeFile(wb, `categories-${new Date().toISOString().split('T')[0]}.xlsx`);
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
      doc.text('CATEGORIES', 14, 27);

      // Separator line
      doc.setFillColor(26, 58, 108);
      doc.rect(14, 31, 100, 1.2, 'F');

      // Date & count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${dateStr}`, 14, 40);
      doc.text(`Total categories: ${filteredCategories.length}`, 14, 47);

      // Table
      autoTable(doc, {
        startY: 55,
        head: [['Name', 'Description', 'Parent Category', 'Status']],
        body: filteredCategories.map((cat) => [
          cat.name || '',
          cat.description
            ? (cat.description.length > 35 ? cat.description.substring(0, 35) + '…' : cat.description)
            : '',
          cat.parentCategoryId
            ? categories.find((c) => c.id === cat.parentCategoryId)?.name || ''
            : '',
          cat.isActive ? 'Active' : 'Inactive',
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
          0: { cellWidth: 38 },
          1: { cellWidth: 65 },
          2: { cellWidth: 40 },
          3: { cellWidth: 22 },
        },
        margin: { left: 14, right: 14 },
      });

      // Footer on every page
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

      doc.save(`categories-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CRUD HANDLERS
  // ──────────────────────────────────────────────────────────────

  const handleCreate = () => { setSelectedCategory(null); setIsCreateModalOpen(true); };
  const handleEdit = (category: Category) => { setSelectedCategory(category); setIsEditModalOpen(true); };
  const handleView = (category: Category) => { setSelectedCategory(category); setIsDetailModalOpen(true); };
  const handleDelete = (category: Category) => { setSelectedCategory(category); setIsDeleteDialogOpen(true); };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await productService.deleteCategory(selectedCategory.id);
      toast.success(t('products.categories.messages.deleteSuccess'));
      fetchCategories();
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error(t('products.categories.messages.deleteError'));
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchCategories();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('products.categories.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('products.categories.subtitle')}</p>
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
          {hasPermission(PERMISSIONS.CATEGORIES_CREATE) && (
            <Button
              variant="outline"
              size="sm"
              icon={<Upload size={15} />}
              onClick={() => setIsImportModalOpen(true)}
            >
              {t('common.import')}
            </Button>
          )}

          {/* New Category */}
          {hasPermission(PERMISSIONS.CATEGORIES_CREATE) && (
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus size={20} />
              {t('products.categories.newCategory')}
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder={t('products.categories.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.items.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('products.categories.table.parentCategory')}
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
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('products.categories.noCategoriesFound')}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-200 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200">
                          {category.parentCategoryId
                            ? categories.find((c) => c.id === category.parentCategoryId)?.name || '-'
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {category.isActive ? t('products.items.statusActive') : t('products.items.statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleView(category)} className="text-blue-600 hover:text-blue-900" title={t('common.view')}>
                            <Eye size={18} />
                          </button>
                          {hasPermission(PERMISSIONS.CATEGORIES_EDIT) && (
                            <button onClick={() => handleEdit(category)} className="text-yellow-600 hover:text-yellow-900" title={t('common.edit')}>
                              <Edit size={18} />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.CATEGORIES_DELETE) && (
                            <button onClick={() => handleDelete(category)} className="text-red-600 hover:text-red-900" title={t('common.delete')}>
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

      {/* Modals */}
      <CategoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedCategory(null); }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); }}
        onSuccess={handleFormSuccess}
        mode="edit"
        category={selectedCategory}
      />

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedCategory(null); }}
        category={selectedCategory}
        onEdit={() => { setIsDetailModalOpen(false); setIsEditModalOpen(true); }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedCategory(null); }}
        onConfirm={confirmDelete}
        title={t('products.categories.deleteTitle')}
        message={t('products.categories.deleteConfirm', { name: selectedCategory?.name || '' })}
      />

      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => { fetchCategories(); setIsImportModalOpen(false); }}
        title="Categories"
        importEndpoint={API_ENDPOINTS.PRODUCTS.CATEGORIES_IMPORT_CSV}
        templateColumns={['name', 'description', 'parentCategoryId', 'isActive']}
        exampleRows={[
          ['Electronics', 'Electronic products', '', 'true'],
        ]}
      />
    </div>
  );
};
