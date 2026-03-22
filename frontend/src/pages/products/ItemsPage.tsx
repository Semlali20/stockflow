// src/pages/products/ItemsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, FileText } from 'lucide-react';
import { productService } from '@/services/product.service';
import { Item } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ItemFormModal } from '@/components/items/ItemFormModal';
import { ItemDetailModal } from '@/components/items/ItemDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ImportCsvModal } from '@/components/ui/ImportCsvModal';
import { ReportModal } from '@/components/ui/ReportModal';
import { useFileDownload } from '@/hooks/useFileDownload';
import { API_ENDPOINTS } from '@/config/constants';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const itemReportColumns = [
  { header: 'SKU', key: 'sku', width: 15 },
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Category', key: 'categoryName', width: 20 },
  { header: 'Serialized', key: 'isSerialized', width: 12 },
  { header: 'Lot Managed', key: 'isLotManaged', width: 12 },
  { header: 'Active', key: 'isActive', width: 10 },
  { header: 'Created At', key: 'createdAt', width: 20 },
];

export const ItemsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { isDownloading, downloadCsv } = useFileDownload();

  // Fetch items and categories
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await productService.getItems();
      // Handle both array response and paginated response
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
      // Handle both array response and paginated response
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item?.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (item?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((item) => item.categoryId === filterCategory);
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter((item) => item.isActive === isActive);
    }

    setFilteredItems(filtered);
  }, [searchTerm, filterCategory, filterStatus, items]);

  // Handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleView = (item: Item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">{t('products.items.title')}</h1>
          <p className="text-gray-600 mt-1">{t('products.items.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={15} />}
            onClick={() => { downloadCsv(API_ENDPOINTS.PRODUCTS.ITEMS_EXPORT_CSV, 'items.csv'); }}
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
            {t('products.items.newItem')}
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full"
          >
            <option value="">{t('products.items.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full"
          >
            <option value="">{t('products.items.allStatus')}</option>
            <option value="active">{t('products.items.statusActive')}</option>
            <option value="inactive">{t('products.items.statusInactive')}</option>
          </Select>
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
                    {t('products.items.table.sku')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.items.table.description')}
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('products.items.noItemsFound')}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {categories.find((c) => c.id === item.categoryId)?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {item.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.isActive ? t('products.items.statusActive') : t('products.items.statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.view')}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={t('common.edit')}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
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
      <ItemFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <ItemFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        item={selectedItem}
      />

      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
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

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={t('products.items.title')}
        description={t('products.items.reportDescription')}
        columns={itemReportColumns}
        fetchData={async () => {
          const result = await productService.getItems({ page: 0, size: 10000 });
          return (Array.isArray(result) ? result : result.content || []) as Record<string, unknown>[];
        }}
        filename="items-report"
      />
    </div>
  );
};