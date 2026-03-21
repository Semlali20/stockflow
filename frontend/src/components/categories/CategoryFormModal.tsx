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
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
    displayOrder: 0,
  });

  // Attribute schemas as array (easier to work with)
  const [attributeSchemas, setAttributeSchemas] = useState<AttributeSchema[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      if (mode === 'edit' && category) {
        // EDIT MODE - Populate form with category data
        setFormData({
          name: category.name || '',
          description: category.description || '',
          parentCategoryId: category.parentCategoryId || '',
          displayOrder: category.displayOrder || 0,
        });

        // Parse existing attribute schemas
        try {
          if (category.attributeSchemas) {
            const parsed = typeof category.attributeSchemas === 'string'
              ? JSON.parse(category.attributeSchemas)
              : category.attributeSchemas;
            
            if (parsed.attributeSchemas && Array.isArray(parsed.attributeSchemas)) {
              setAttributeSchemas(parsed.attributeSchemas);
            } else {
              setAttributeSchemas([]);
            }
          } else {
            setAttributeSchemas([]);
          }
        } catch (error) {
          console.error('Error parsing attribute schemas:', error);
          setAttributeSchemas([]);
        }
      } else {
        // CREATE MODE - Reset form
        setFormData({
          name: '',
          description: '',
          parentCategoryId: '',
          displayOrder: 0,
        });
        setAttributeSchemas([]);
      }
    }
  }, [isOpen, mode, category]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      const data = Array.isArray(response) ? response : response?.content || [];
      
      // Filter out current category when editing to prevent self-reference
      const filtered = mode === 'edit' && category 
        ? data.filter((cat: any) => cat.id !== category.id)
        : data;
      
      setCategories(filtered);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  // Add new attribute schema
  const addAttributeSchema = () => {
    setAttributeSchemas([
      ...attributeSchemas,
      { name: '', type: 'string', required: false }
    ]);
  };

  // Remove attribute schema
  const removeAttributeSchema = (index: number) => {
    setAttributeSchemas(attributeSchemas.filter((_, i) => i !== index));
  };

  // Update attribute schema
  const updateAttributeSchema = (index: number, field: keyof AttributeSchema, value: any) => {
    const updated = [...attributeSchemas];
    updated[index] = { ...updated[index], [field]: value };
    setAttributeSchemas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert attribute schemas array to JSON string
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? t('products.categories.form.editTitle') : t('products.categories.form.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name - REQUIRED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.categories.form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
                placeholder={t('products.categories.form.namePlaceholder')}
              />
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.categories.form.parentCategory')}
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.parentCategoryId}
                onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value })}
              >
                <option value="">{t('products.categories.form.noneRoot')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.categories.form.description')}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder={t('products.categories.form.descriptionPlaceholder')}
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.categories.form.displayOrder')}
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              min={0}
              placeholder="0"
            />
          </div>

          {/* Attribute Schemas Builder */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('products.categories.form.attributeSchemas')}
              </label>
              <button
                type="button"
                onClick={addAttributeSchema}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={16} />
                {t('products.categories.form.addAttribute')}
              </button>
            </div>

            <div className="space-y-3">
              {attributeSchemas.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm">
                    {t('products.categories.form.noAttributes')}
                  </p>
                </div>
              ) : (
                attributeSchemas.map((schema, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {/* Attribute Name */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('products.categories.form.attrName')}
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={schema.name}
                        onChange={(e) => updateAttributeSchema(index, 'name', e.target.value)}
                        placeholder={t('products.categories.form.attrNamePlaceholder')}
                        required
                      />
                    </div>

                    {/* Attribute Type */}
                    <div className="w-40">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {t('products.categories.form.type')}
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={schema.type}
                        onChange={(e) => updateAttributeSchema(index, 'type', e.target.value)}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    {/* Required Checkbox */}
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={schema.required}
                          onChange={(e) => updateAttributeSchema(index, 'required', e.target.checked)}
                        />
                        <span className="text-xs text-gray-600">{t('products.categories.form.required')}</span>
                      </label>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeAttributeSchema(index)}
                      className="flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-50 rounded mt-5"
                      title={t('common.remove')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Preview */}
            {attributeSchemas.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-2">{t('products.categories.form.jsonPreview')}</p>
                <pre className="text-xs text-blue-700 overflow-x-auto">
                  {JSON.stringify({ attributeSchemas }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? t('products.categories.form.saving') : (mode === 'edit' ? t('products.categories.form.update') : t('products.categories.form.create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};