// src/components/items/ItemFormModal.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ImageIcon } from 'lucide-react';
import { productService } from '@/services/product.service';
import { Item } from '@/types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  item?: Item | null;
}

interface CategoryAttributeSchema {
  name: string;
  type: string;
  required: boolean;
}

interface DynamicAttribute {
  name: string;
  type: string;
  required: boolean;
  value: string;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  item
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    categoryId: '',
    sku: '',
    name: '',
    description: '',
    tags: '',
    isSerialized: false,
    isLotManaged: false,
    shelfLifeDays: 0,
    hazardousMaterial: false,
  });

  const [dynamicAttributes, setDynamicAttributes] = useState<DynamicAttribute[]>([]);
  const [temperatureControls, setTemperatureControls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      if (mode === 'edit' && item) {
        setFormData({
          categoryId: item.categoryId || '',
          sku: item.sku || '',
          name: item.name || '',
          description: item.description || '',
          tags: item.tags || '',
          isSerialized: item.isSerialized || false,
          isLotManaged: item.isLotManaged || false,
          shelfLifeDays: item.shelfLifeDays || 0,
          hazardousMaterial: item.hazardousMaterial || false,
        });

        try {
          if (item.attributes) {
            const parsed = typeof item.attributes === 'string'
              ? JSON.parse(item.attributes)
              : item.attributes;
            if (item.categoryId) {
              loadCategoryAndAttributes(item.categoryId, parsed);
            }
          }
        } catch (error) {
          console.error('Error parsing attributes:', error);
        }

        try {
          if (item.temperatureControl) {
            const parsed = typeof item.temperatureControl === 'string'
              ? JSON.parse(item.temperatureControl)
              : item.temperatureControl;
            if (Array.isArray(parsed)) {
              setTemperatureControls(parsed);
            }
          }
        } catch (error) {
          console.error('Error parsing temperature controls:', error);
        }

        if (item.imageUrl) {
          setImagePreview(item.imageUrl);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, item]);

  const resetForm = () => {
    setFormData({
      categoryId: '',
      sku: '',
      name: '',
      description: '',
      tags: '',
      isSerialized: false,
      isLotManaged: false,
      shelfLifeDays: 0,
      hazardousMaterial: false,
    });
    setDynamicAttributes([]);
    setTemperatureControls([]);
    setImagePreview('');
    setSelectedCategory(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      const data = Array.isArray(response) ? response : response?.content || [];
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const loadCategoryAndAttributes = async (categoryId: string, existingValues?: any) => {
    try {
      const category = await productService.getCategoryById(categoryId);
      setSelectedCategory(category);

      if (category.attributeSchemas) {
        try {
          const schemas = typeof category.attributeSchemas === 'string'
            ? JSON.parse(category.attributeSchemas)
            : category.attributeSchemas;

          if (schemas.attributeSchemas && Array.isArray(schemas.attributeSchemas)) {
            const attrs: DynamicAttribute[] = schemas.attributeSchemas.map((schema: CategoryAttributeSchema) => ({
              name: schema.name,
              type: schema.type,
              required: schema.required,
              value: existingValues?.[schema.name] || ''
            }));
            setDynamicAttributes(attrs);
          } else {
            setDynamicAttributes([]);
          }
        } catch (error) {
          console.error('Error parsing attribute schemas:', error);
          setDynamicAttributes([]);
        }
      } else {
        setDynamicAttributes([]);
      }
    } catch (error) {
      console.error('Failed to load category:', error);
      setDynamicAttributes([]);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setFormData({ ...formData, categoryId });
    if (categoryId) {
      await loadCategoryAndAttributes(categoryId);
    } else {
      setSelectedCategory(null);
      setDynamicAttributes([]);
    }
  };

  const updateDynamicAttribute = (index: number, value: string) => {
    const updated = [...dynamicAttributes];
    updated[index].value = value;
    setDynamicAttributes(updated);
  };

  const addTemperatureControl = () => setTemperatureControls([...temperatureControls, '']);
  const removeTemperatureControl = (index: number) =>
    setTemperatureControls(temperatureControls.filter((_, i) => i !== index));
  const updateTemperatureControl = (index: number, value: string) => {
    const updated = [...temperatureControls];
    updated[index] = value;
    setTemperatureControls(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error(t('products.items.form.messages.imageSizeError')); return; }
      if (!file.type.startsWith('image/')) { toast.error(t('products.items.form.messages.imageTypeError')); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.onerror = () => toast.error(t('products.items.form.messages.imageReadError'));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingRequired = dynamicAttributes
      .filter(attr => attr.required && !attr.value.trim())
      .map(attr => attr.name);

    if (missingRequired.length > 0) {
      toast.error(t('products.items.form.messages.requiredAttributes', { names: missingRequired.join(', ') }));
      return;
    }

    setLoading(true);
    try {
      const attributesObj: Record<string, any> = {};
      dynamicAttributes.forEach(attr => {
        if (attr.value) {
          if (attr.type === 'number') attributesObj[attr.name] = parseFloat(attr.value) || 0;
          else if (attr.type === 'boolean') attributesObj[attr.name] = attr.value === 'true';
          else attributesObj[attr.name] = attr.value;
        }
      });
      const attributesJson = Object.keys(attributesObj).length > 0 ? JSON.stringify(attributesObj) : null;

      const tempArray = temperatureControls.filter(tc => tc.trim() !== '');
      const temperatureControlJson = tempArray.length > 0 ? JSON.stringify(tempArray) : null;

      const requestData: Partial<Item> = {
        categoryId: formData.categoryId,
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        attributes: attributesJson || undefined,
        tags: formData.tags || undefined,
        imageUrl: imagePreview || undefined,
        isSerialized: formData.isSerialized,
        isLotManaged: formData.isLotManaged,
        shelfLifeDays: formData.shelfLifeDays > 0 ? formData.shelfLifeDays : undefined,
        hazardousMaterial: formData.hazardousMaterial,
        temperatureControl: temperatureControlJson || undefined
      };

      if (mode === 'edit' && item) {
        await productService.updateItem(item.id, requestData);
        toast.success(t('products.items.form.messages.updateSuccess'));
      } else {
        await productService.createItem(requestData);
        toast.success(t('products.items.form.messages.createSuccess'));
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? t('products.items.form.editTitle') : t('products.items.form.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left & Center */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t('products.items.form.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                  >
                    <option value="">{t('products.items.form.selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('products.items.form.sku')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    maxLength={50}
                    placeholder={t('products.items.form.skuPlaceholder')}
                    disabled={mode === 'edit'}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>
                  {t('products.items.form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={200}
                  placeholder={t('products.items.form.namePlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>{t('products.items.form.description')}</label>
                <textarea
                  className={inputCls}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  placeholder={t('products.items.form.descriptionPlaceholder')}
                />
              </div>

              {/* Dynamic Attributes */}
              {selectedCategory && (
                <div className="border-t border-gray-200 dark:border-neutral-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('products.items.form.categoryAttributes')}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                      {t('products.items.form.fromCategory', { name: selectedCategory.name })}
                    </span>
                  </h3>

                  {dynamicAttributes.length === 0 ? (
                    <div className="p-6 bg-gray-50 dark:bg-neutral-800 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{t('products.items.form.noAttributes')}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('products.items.form.editCategoryToAdd')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dynamicAttributes.map((attr, index) => (
                        <div key={index} className="space-y-1">
                          <label className={labelCls}>
                            {attr.name}
                            {attr.required && <span className="text-red-500 ml-1">*</span>}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({attr.type})</span>
                          </label>

                          {attr.type === 'boolean' ? (
                            <select
                              className={inputCls}
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                            >
                              <option value="">{t('products.items.form.select')}</option>
                              <option value="true">{t('products.items.form.yes')}</option>
                              <option value="false">{t('products.items.form.no')}</option>
                            </select>
                          ) : (
                            <input
                              type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                              className={inputCls}
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                              step={attr.type === 'number' ? 'any' : undefined}
                              placeholder={attr.type !== 'date' ? t('products.items.form.enterAttribute', { name: attr.name }) : undefined}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label className={labelCls}>{t('products.items.form.tags')}</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  maxLength={500}
                  placeholder={t('products.items.form.tagsPlaceholder')}
                />
              </div>

              {/* Temperature Controls */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className={labelCls + ' mb-0'}>{t('products.items.form.temperatureControls')}</label>
                  <button
                    type="button"
                    onClick={addTemperatureControl}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('products.items.form.add')}
                  </button>
                </div>

                {temperatureControls.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t('products.items.form.noTemperatureControls')}</p>
                ) : (
                  <div className="space-y-2">
                    {temperatureControls.map((tc, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className={inputCls}
                          value={tc}
                          onChange={(e) => updateTemperatureControl(index, e.target.value)}
                          placeholder={t('products.items.form.tempControlPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => removeTemperatureControl(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shelf Life */}
              <div>
                <label className={labelCls}>{t('products.items.form.shelfLife')}</label>
                <input
                  type="number"
                  className={inputCls}
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) || 0 })}
                  min={0}
                  placeholder={t('products.items.form.shelfLifePlaceholder')}
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                {[
                  { key: 'isSerialized', label: t('products.items.form.isSerialized') },
                  { key: 'isLotManaged', label: t('products.items.form.isLotManaged') },
                  { key: 'hazardousMaterial', label: t('products.items.form.hazardousMaterial') },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t('products.items.form.itemImage')}</label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-neutral-600"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{t('products.items.form.clickToUpload')}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('products.items.form.uploadFormats')}</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('products.items.form.imageConversion')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-neutral-700">
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading
                ? t('products.items.form.saving')
                : mode === 'edit'
                ? t('products.items.form.update')
                : t('products.items.form.create')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
