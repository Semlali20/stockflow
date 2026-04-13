// src/components/item-variants/ItemVariantFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { productService } from '@/services/product.service';
import { ItemVariant } from '@/types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ItemVariantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  variant?: ItemVariant | null;
}

interface AttributeItem {
  key: string;
  value: string;
}

export const ItemVariantFormModal: React.FC<ItemVariantFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  variant
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    parentItemId: '',
    sku: '',
  });

  // Variant attributes as array (easier to work with)
  const [variantAttributes, setVariantAttributes] = useState<AttributeItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      
      if (mode === 'edit' && variant) {
        // EDIT MODE - Populate form with variant data
        setFormData({
          parentItemId: variant.parentItemId || '',
          sku: variant.sku || '',
        });

        // Parse existing variant attributes
        try {
          if (variant.attributes) {
            const parsed = typeof variant.attributes === 'string'
              ? JSON.parse(variant.attributes)
              : variant.attributes;
            
            const attrsArray = Object.entries(parsed).map(([key, value]) => ({
              key,
              value: String(value)
            }));
            setVariantAttributes(attrsArray);
          } else {
            setVariantAttributes([]);
          }
        } catch (error) {
          console.error('Error parsing variant attributes:', error);
          setVariantAttributes([]);
        }
      } else {
        // CREATE MODE - Reset form
        setFormData({
          parentItemId: '',
          sku: '',
        });
        setVariantAttributes([]);
        setSelectedItem(null);
      }
    }
  }, [isOpen, mode, variant]);

  const fetchItems = async () => {
    try {
      const response = await productService.getItems();
      const data = Array.isArray(response) ? response : response?.content || [];
      setItems(data);
      
      // If editing, find and set the selected item
      if (mode === 'edit' && variant?.parentItemId) {
        const item = data.find((i: any) => i.id === variant.parentItemId);
        setSelectedItem(item);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    }
  };

  // Handle parent item selection
  const handleParentItemChange = (itemId: string) => {
    setFormData({ ...formData, parentItemId: itemId });
    const item = items.find((i: any) => i.id === itemId);
    setSelectedItem(item);
    
    // Auto-populate variant attributes from parent item if available
    if (item && item.attributes && variantAttributes.length === 0) {
      try {
        const parsed = typeof item.attributes === 'string'
          ? JSON.parse(item.attributes)
          : item.attributes;
        
        const attrsArray = Object.entries(parsed).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        setVariantAttributes(attrsArray);
        toast(t('products.variants.form.messages.attributesLoaded'));
      } catch (error) {
        console.error('Error parsing parent attributes:', error);
      }
    }
  };

  // Add new variant attribute
  const addVariantAttribute = () => {
    setVariantAttributes([...variantAttributes, { key: '', value: '' }]);
  };

  // Remove variant attribute
  const removeVariantAttribute = (index: number) => {
    setVariantAttributes(variantAttributes.filter((_, i) => i !== index));
  };

  // Update variant attribute
  const updateVariantAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...variantAttributes];
    updated[index] = { ...updated[index], [field]: value };
    setVariantAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert variant attributes array to JSON object
      const variantAttrsObj: Record<string, string> = {};
      variantAttributes.forEach(attr => {
        if (attr.key && attr.value) {
          variantAttrsObj[attr.key] = attr.value;
        }
      });
      const variantAttributesJson = Object.keys(variantAttrsObj).length > 0
        ? JSON.stringify(variantAttrsObj)
        : null;

      const requestData = {
        parentItemId: formData.parentItemId,
        sku: formData.sku,
        variantAttributes: variantAttributesJson
      };

      if (mode === 'edit' && variant) {
        await productService.updateItemVariant(variant.id, requestData);
        toast.success(t('products.variants.form.messages.updateSuccess'));
      } else {
        await productService.createItemVariant(requestData);
        toast.success(t('products.variants.form.messages.createSuccess'));
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? t('products.variants.form.editTitle') : t('products.variants.form.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Item - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.variants.form.parentItem')} <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.parentItemId}
              onChange={(e) => handleParentItemChange(e.target.value)}
              required
            >
              <option value="">{t('products.variants.form.selectParentItem')}</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {t('products.variants.form.parentItemHint')}
            </p>
          </div>

          {/* Show parent item info if selected */}
          {selectedItem && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">{t('products.variants.form.parentItemInfo')}</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><span className="font-medium">{t('products.items.table.name')}:</span> {selectedItem.name}</p>
                <p><span className="font-medium">{t('products.items.table.sku')}:</span> {selectedItem.sku}</p>
                <p><span className="font-medium">{t('products.items.table.category')}:</span> {selectedItem.categoryName || 'N/A'}</p>
                {selectedItem.attributes && (
                  <div>
                    <span className="font-medium">{t('products.variants.table.attributes')}:</span>
                    <pre className="text-xs mt-1 bg-blue-100 p-2 rounded overflow-x-auto">
                      {typeof selectedItem.attributes === 'string' 
                        ? selectedItem.attributes 
                        : JSON.stringify(selectedItem.attributes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKU - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.variants.form.sku')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              maxLength={50}
              placeholder={t('products.variants.form.skuPlaceholder')}
              disabled={mode === 'edit'}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t('products.variants.form.skuHint')} {mode === 'edit' && t('products.variants.form.skuEditHint')}
            </p>
          </div>

          {/* Variant Attributes Builder */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {t('products.variants.form.attributes')}
              </label>
              <button
                type="button"
                onClick={addVariantAttribute}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                <Plus size={16} />
                {t('products.variants.form.addAttribute')}
              </button>
            </div>

            <div className="space-y-3">
              {variantAttributes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm mb-2">
                    {t('products.variants.form.noAttributes')}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {t('products.variants.form.attributesHint')}<br />
                    {t('products.variants.form.attributesExample')}
                  </p>
                </div>
              ) : (
                variantAttributes.map((attr, index) => (
                  <div key={index} className="flex gap-3 items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={attr.key}
                        onChange={(e) => updateVariantAttribute(index, 'key', e.target.value)}
                        placeholder={t('products.variants.form.attrNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={attr.value}
                        onChange={(e) => updateVariantAttribute(index, 'value', e.target.value)}
                        placeholder={t('products.variants.form.attrValuePlaceholder')}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantAttribute(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                      title={t('common.remove')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>


            {/* Help Text */}
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <span className="font-medium">💡 {t('products.variants.form.tip')}</span> {t('products.variants.form.tipContent')}
              </p>
            </div>
          </div>

          {/* Example Section */}
          <div className="border-t pt-4">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                📖 {t('products.variants.form.viewExamples')}
              </summary>
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-gray-700 mb-1">{t('products.variants.form.example1Title')}</p>
                  <pre className="text-gray-600 overflow-x-auto">
{`{
  "size": "Large",
  "color": "Blue",
  "fit": "Regular"
}`}
                  </pre>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-gray-700 mb-1">{t('products.variants.form.example2Title')}</p>
                  <pre className="text-gray-600 overflow-x-auto">
{`{
  "ram": "32GB",
  "storage": "1TB SSD",
  "color": "Space Gray",
  "graphics": "NVIDIA RTX 3050"
}`}
                  </pre>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium text-gray-700 mb-1">{t('products.variants.form.example3Title')}</p>
                  <pre className="text-gray-600 overflow-x-auto">
{`{
  "storage": "256GB",
  "color": "Midnight Black",
  "carrier": "Unlocked"
}`}
                  </pre>
                </div>
              </div>
            </details>
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
              {loading ? t('products.variants.form.saving') : (mode === 'edit' ? t('products.variants.form.update') : t('products.variants.form.create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};