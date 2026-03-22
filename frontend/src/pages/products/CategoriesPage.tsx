// src/pages/products/CategoriesPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, FileText } from 'lucide-react';
import { productService } from '@/services/product.service';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { CategoryDetailModal } from '@/components/categories/CategoryDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { ReportModal } from '@/components/ui/ReportModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const categoryReportColumns = [
  { header: 'Name', key: 'name', width: 25 },
  { header: 'Description', key: 'description', width: 40 },
  { header: 'Parent Category', key: 'parentCategoryName', width: 20 },
  { header: 'Active', key: 'isActive', width: 10 },
  { header: 'Created At', key: 'createdAt', width: 20 },
];

export const CategoriesPage = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { isDownloading, downloadCsv } = useFileDownload();

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await productService.getCategories();
      // Handle both array response and paginated response
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

  // Handlers
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">{t('products.categories.title')}</h1>
          <p className="text-gray-600 mt-1">{t('products.categories.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={15} />}
            onClick={() => downloadCsv(API_ENDPOINTS.PRODUCTS.CATEGORIES_EXPORT_CSV, 'categories.csv')}
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
            {t('products.categories.newCategory')}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.categories.table.parentCategory')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('products.categories.noCategoriesFound')}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.parentCategoryId
                            ? categories.find((c) => c.id === category.parentCategoryId)?.name || '-'
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? t('products.items.statusActive') : t('products.items.statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.view')}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={t('common.edit')}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
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

      {/* Modals */}
      <CategoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        category={selectedCategory}
      />

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCategory(null);
        }}
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

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('products.categories.title')}
        description={t('products.categories.reportDescription')}
        columns={categoryReportColumns}
        fetchData={async () => {
          const result = await productService.getCategories({ page: 0, size: 10000 });
          return (Array.isArray(result) ? result : result.content || []) as Record<string, unknown>[];
        }}
        filename="categories-report"
      />
    </div>
  );
};