// src/components/item-variants/ItemVariantFormModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
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
  const [itemSearch, setItemSearch] = useState('');
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const itemDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ parentItemId: '', sku: '' });
  const [variantAttributes, setVariantAttributes] = useState<AttributeItem[]>([]);

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

      if (mode === 'edit' && variant) {
        setFormData({ parentItemId: variant.parentItemId || '', sku: variant.sku || '' });
        try {
          if (variant.attributes) {
            const parsed = typeof variant.attributes === 'string'
              ? JSON.parse(variant.attributes)
              : variant.attributes;
            setVariantAttributes(Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) })));
          } else {
            setVariantAttributes([]);
          }
        } catch (error) {
          console.error('Error parsing variant attributes:', error);
          setVariantAttributes([]);
        }
      } else {
        setFormData({ parentItemId: '', sku: '' });
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
      if (mode === 'edit' && variant?.parentItemId) {
        setSelectedItem(data.find((i: any) => i.id === variant.parentItemId));
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    }
  };

  const handleParentItemChange = (itemId: string) => {
    setFormData({ ...formData, parentItemId: itemId });
    const item = items.find((i: any) => i.id === itemId);
    setSelectedItem(item);
    if (item && item.attributes && variantAttributes.length === 0) {
      try {
        const parsed = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
        setVariantAttributes(Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) })));
        toast(t('products.variants.form.messages.attributesLoaded'));
      } catch (error) {
        console.error('Error parsing parent attributes:', error);
      }
    }
  };

  const addVariantAttribute = () => setVariantAttributes([...variantAttributes, { key: '', value: '' }]);
  const removeVariantAttribute = (index: number) => setVariantAttributes(variantAttributes.filter((_, i) => i !== index));
  const updateVariantAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...variantAttributes];
    updated[index] = { ...updated[index], [field]: value };
    setVariantAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const variantAttrsObj: Record<string, string> = {};
      variantAttributes.forEach(attr => { if (attr.key && attr.value) variantAttrsObj[attr.key] = attr.value; });
      const variantAttributesJson = Object.keys(variantAttrsObj).length > 0 ? JSON.stringify(variantAttrsObj) : null;

      const requestData = { parentItemId: formData.parentItemId, sku: formData.sku, variantAttributes: variantAttributesJson };

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
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = 'w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-4 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? t('products.variants.form.editTitle') : t('products.variants.form.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Item */}
          <div>
            <label className={labelCls}>
              {t('products.variants.form.parentItem')} <span className="text-red-500">*</span>
            </label>
            <div ref={itemDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => { setItemDropdownOpen(o => !o); setItemSearch(''); }}
                className={`${inputCls} flex items-center justify-between text-left w-full`}
              >
                <span className={formData.parentItemId ? '' : 'text-gray-400 dark:text-gray-500'}>
                  {formData.parentItemId
                    ? (() => { const i = items.find(x => x.id === formData.parentItemId); return i ? `${i.name} (${i.sku})` : t('products.variants.form.selectParentItem'); })()
                    : t('products.variants.form.selectParentItem')}
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
                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {items
                      .filter(i => `${i.name} ${i.sku}`.toLowerCase().includes(itemSearch.toLowerCase()))
                      .map(item => (
                        <li
                          key={item.id}
                          onClick={() => { handleParentItemChange(item.id); setItemDropdownOpen(false); }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
                            formData.parentItemId === item.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-700 dark:text-gray-300'
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('products.variants.form.parentItemHint')}</p>
          </div>

          {/* Selected item info */}
          {selectedItem && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                {t('products.variants.form.parentItemInfo')}
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p><span className="font-medium">{t('products.items.table.name')}:</span> {selectedItem.name}</p>
                <p><span className="font-medium">{t('products.items.table.sku')}:</span> {selectedItem.sku}</p>
                <p><span className="font-medium">{t('products.items.table.category')}:</span> {selectedItem.categoryName || 'N/A'}</p>
                {selectedItem.attributes && (
                  <div>
                    <span className="font-medium">{t('products.variants.table.attributes')}:</span>
                    <pre className="text-xs mt-1 bg-blue-100 dark:bg-blue-900/40 p-2 rounded overflow-x-auto text-blue-900 dark:text-blue-200">
                      {typeof selectedItem.attributes === 'string'
                        ? selectedItem.attributes
                        : JSON.stringify(selectedItem.attributes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKU */}
          <div>
            <label className={labelCls}>
              {t('products.variants.form.sku')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              maxLength={50}
              placeholder={t('products.variants.form.skuPlaceholder')}
              disabled={mode === 'edit'}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('products.variants.form.skuHint')} {mode === 'edit' && t('products.variants.form.skuEditHint')}
            </p>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className={labelCls + ' mb-0'}>{t('products.variants.form.attributes')}</label>
              <button
                type="button"
                onClick={addVariantAttribute}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                {t('products.variants.form.addAttribute')}
              </button>
            </div>

            <div className="space-y-3">
              {variantAttributes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{t('products.variants.form.noAttributes')}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {t('products.variants.form.attributesHint')}<br />
                    {t('products.variants.form.attributesExample')}
                  </p>
                </div>
              ) : (
                variantAttributes.map((attr, index) => (
                  <div key={index} className="flex gap-3 items-center p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                        value={attr.key}
                        onChange={(e) => updateVariantAttribute(index, 'key', e.target.value)}
                        placeholder={t('products.variants.form.attrNamePlaceholder')}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-neutral-600 rounded px-3 py-2 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                        value={attr.value}
                        onChange={(e) => updateVariantAttribute(index, 'value', e.target.value)}
                        placeholder={t('products.variants.form.attrValuePlaceholder')}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariantAttribute(index)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <span className="font-medium">💡 {t('products.variants.form.tip')}</span> {t('products.variants.form.tipContent')}
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <details className="cursor-pointer">
              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                📖 {t('products.variants.form.viewExamples')}
              </summary>
              <div className="mt-3 space-y-3 text-xs">
                {[
                  { title: t('products.variants.form.example1Title'), code: `{\n  "size": "Large",\n  "color": "Blue",\n  "fit": "Regular"\n}` },
                  { title: t('products.variants.form.example2Title'), code: `{\n  "ram": "32GB",\n  "storage": "1TB SSD",\n  "color": "Space Gray"\n}` },
                  { title: t('products.variants.form.example3Title'), code: `{\n  "storage": "256GB",\n  "color": "Midnight Black",\n  "carrier": "Unlocked"\n}` },
                ].map((ex, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{ex.title}</p>
                    <pre className="text-gray-600 dark:text-gray-400 overflow-x-auto">{ex.code}</pre>
                  </div>
                ))}
              </div>
            </details>
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
                ? t('products.variants.form.saving')
                : mode === 'edit'
                ? t('products.variants.form.update')
                : t('products.variants.form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
