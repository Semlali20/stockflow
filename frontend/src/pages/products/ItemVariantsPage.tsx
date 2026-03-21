// src/pages/products/ItemVariantsPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { productService } from '@/services/product.service';
import { ItemVariant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ItemVariantFormModal } from '@/components/item-variants/ItemVariantFormModal';
import { ItemVariantDetailModal } from '@/components/item-variants/ItemVariantDetailModal';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ItemVariantsPage = () => {
  const { t } = useTranslation();
  const [variants, setVariants] = useState<ItemVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ItemVariant[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);

  // Fetch variants and items
  const fetchVariants = async () => {
    setLoading(true);
    try {
      const data = await productService.getItemVariants();
      // Handle both array response and paginated response
      const variantsArray = Array.isArray(data) ? data : (data?.content || []);
      setVariants(variantsArray);
      setFilteredVariants(variantsArray);
    } catch (error) {
      toast.error(t('products.variants.messages.fetchError'));
      console.error(error);
      setVariants([]);
      setFilteredVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await productService.getItems();
      // Handle both array response and paginated response
      const itemsArray = Array.isArray(data) ? data : (data?.content || []);
      setItems(itemsArray);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchVariants();
    fetchItems();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = variants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (variant) =>
          variant.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Item filter
    if (filterItem) {
      filtered = filtered.filter((variant) => variant.parentItemId === filterItem);
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter((variant) => variant.isActive === isActive);
    }

    setFilteredVariants(filtered);
  }, [searchTerm, filterItem, filterStatus, variants]);

  // Handlers
  const handleCreate = () => {
    setSelectedVariant(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (variant: ItemVariant) => {
    setSelectedVariant(variant);
    setIsEditModalOpen(true);
  };

  const handleView = (variant: ItemVariant) => {
    setSelectedVariant(variant);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (variant: ItemVariant) => {
    setSelectedVariant(variant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVariant) return;

    try {
      await productService.deleteItemVariant(selectedVariant.id);
      toast.success(t('products.variants.messages.deleteSuccess'));
      fetchVariants();
      setIsDeleteDialogOpen(false);
      setSelectedVariant(null);
    } catch (error) {
      toast.error(t('products.variants.messages.deleteError'));
      console.error(error);
    }
  };

  const handleFormSuccess = () => {
    fetchVariants();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedVariant(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('products.variants.title')}</h1>
          <p className="text-gray-600 mt-1">{t('products.variants.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          {t('products.variants.newVariant')}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={t('products.variants.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            className="w-full"
          >
            <option value="">{t('products.variants.allItems')}</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
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
                    {t('products.variants.table.parentItem')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.variants.table.attributes')}
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
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('products.variants.noVariantsFound')}
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{variant.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{variant.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {items.find((i) => i.id === variant.parentItemId)?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {variant.attributes && Object.keys(variant.attributes).length > 0
                            ? Object.entries(variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            variant.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {variant.isActive ? t('products.items.statusActive') : t('products.items.statusInactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(variant)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('common.view')}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(variant)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={t('common.edit')}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(variant)}
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
      <ItemVariantFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedVariant(null);
        }}
        onSuccess={handleFormSuccess}
        mode="create"
      />

      <ItemVariantFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVariant(null);
        }}
        onSuccess={handleFormSuccess}
        mode="edit"
        variant={selectedVariant}
      />

      <ItemVariantDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVariant(null);
        }}
        variant={selectedVariant}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedVariant(null);
        }}
        onConfirm={confirmDelete}
        title={t('products.variants.deleteTitle')}
        message={t('products.variants.deleteConfirm')}
      />
    </div>
  );
};