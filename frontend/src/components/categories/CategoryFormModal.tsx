// src/components/categories/CategoryFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { productService } from '@/services/product.service';
import { Category } from '@/types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  category?: Category | null;
}

interface AttributeSchema {
  name: string;
  type: string;
  required: boolean;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  category
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
    displayOrder: 0,
  });

  const [attributeSchemas, setAttributeSchemas] = useState<AttributeSchema[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      if (mode === 'edit' && category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parentCategoryId: category.parentCategoryId || '',
          displayOrder: category.displayOrder || 0,
        });

        try {
          if (category.attributeSchemas) {
            const parsed = typeof category.attributeSchemas === 'string'
              ? JSON.parse(category.attributeSchemas)
              : category.attributeSchemas;
            setAttributeSchemas(
              parsed.attributeSchemas && Array.isArray(parsed.attributeSchemas)
                ? parsed.attributeSchemas
                : []
            );
          } else {
            setAttributeSchemas([]);
          }
        } catch (error) {
          console.error('Error parsing attribute schemas:', error);
          setAttributeSchemas([]);
        }
      } else {
        setFormData({ name: '', description: '', parentCategoryId: '', displayOrder: 0 });
        setAttributeSchemas([]);
      }
    }
  }, [isOpen, mode, category]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      const data = Array.isArray(response) ? response : response?.content || [];
      const filtered = mode === 'edit' && category
        ? data.filter((cat: any) => cat.id !== category.id)
        : data;
      setCategories(filtered);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const addAttributeSchema = () =>
    setAttributeSchemas([...attributeSchemas, { name: '', type: 'string', required: false }]);

  const removeAttributeSchema = (index: number) =>
    setAttributeSchemas(attributeSchemas.filter((_, i) => i !== index));

  const updateAttributeSchema = (index: number, field: keyof AttributeSchema, value: any) => {
    const updated = [...attributeSchemas];
    updated[index] = { ...updated[index], [field]: value };
    setAttributeSchemas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const attributeSchemasJson = attributeSchemas.length > 0
        ? JSON.stringify({ attributeSchemas })
        : undefined;

      const requestData = {
        name: formData.name,
        description: formData.description || undefined,
        parentCategoryId: formData.parentCategoryId || undefined,
        displayOrder: formData.displayOrder || undefined,
        attributeSchemas: attributeSchemasJson
      };

      if (mode === 'edit' && category) {
        await productService.updateCategory(category.id, requestData);
        toast.success(t('products.categories.form.messages.updateSuccess'));
      } else {
        await productService.createCategory(requestData);
        toast.success(t('products.categories.form.messages.createSuccess'));
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

  const inputCls = 'w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? t('products.categories.form.editTitle') : t('products.categories.form.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name + Parent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                {t('products.categories.form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                placeholder={t('products.categories.form.namePlaceholder')}
              />
            </div>

            <div>
              <label className={labelCls}>{t('products.categories.form.parentCategory')}</label>
              <select
                className={inputCls}
                value={formData.parentCategoryId}
                onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
              >
                <option value="">{t('products.categories.form.noneRoot')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>{t('products.categories.form.description')}</label>
            <textarea
              className={inputCls}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder={t('products.categories.form.descriptionPlaceholder')}
            />
          </div>

          {/* Display Order */}
          <div>
            <label className={labelCls}>{t('products.categories.form.displayOrder')}</label>
            <input
              type="number"
              className={inputCls}
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              min={0}
              placeholder="0"
            />
          </div>

          {/* Attribute Schemas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelCls + ' mb-0'}>{t('products.categories.form.attributeSchemas')}</label>
              <button
                type="button"
                onClick={addAttributeSchema}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                {t('products.categories.form.addAttribute')}
              </button>
            </div>

            <div className="space-y-3">
              {attributeSchemas.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('products.categories.form.noAttributes')}
                  </p>
                </div>
              ) : (
                attributeSchemas.map((schema, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('products.categories.form.attrName')}
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                        value={schema.name}
                        onChange={(e) => updateAttributeSchema(index, 'name', e.target.value)}
                        placeholder={t('products.categories.form.attrNamePlaceholder')}
                        required
                      />
                    </div>

                    <div className="w-40">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('products.categories.form.type')}
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                        value={schema.type}
                        onChange={(e) => updateAttributeSchema(index, 'type', e.target.value)}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 accent-blue-600 rounded"
                          checked={schema.required}
                          onChange={(e) => updateAttributeSchema(index, 'required', e.target.checked)}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('products.categories.form.required')}
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttributeSchema(index)}
                      className="flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded mt-5 transition-colors"
                      title={t('common.remove')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? t('products.categories.form.saving')
                : mode === 'edit'
                ? t('products.categories.form.update')
                : t('products.categories.form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
