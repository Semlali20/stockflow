// src/components/items/ItemFormModal.tsx
import React, { useState, useEffect } from 'react';
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
  
  // Form data
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

  // Dynamic attributes based on category schema
  const [dynamicAttributes, setDynamicAttributes] = useState<DynamicAttribute[]>([]);
  
  // Temperature controls
  const [temperatureControls, setTemperatureControls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      if (mode === 'edit' && item) {
        // EDIT MODE - Populate form with item data
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

        // Parse existing attributes
        try {
          if (item.attributes) {
            const parsed = typeof item.attributes === 'string' 
              ? JSON.parse(item.attributes) 
              : item.attributes;
            
            // Will be populated after category is loaded
            if (item.categoryId) {
              loadCategoryAndAttributes(item.categoryId, parsed);
            }
          }
        } catch (error) {
          console.error('Error parsing attributes:', error);
        }

        // Parse temperature controls
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

        // Set image preview
        if (item.imageUrl) {
          setImagePreview(item.imageUrl);
        }
      } else {
        // CREATE MODE - Reset form
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
      
      // Parse attribute schemas from category
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

  const addTemperatureControl = () => {
    setTemperatureControls([...temperatureControls, '']);
  };

  const removeTemperatureControl = (index: number) => {
    setTemperatureControls(temperatureControls.filter((_, i) => i !== index));
  };

  const updateTemperatureControl = (index: number, value: string) => {
    const updated = [...temperatureControls];
    updated[index] = value;
    setTemperatureControls(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('products.items.form.messages.imageSizeError'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(t('products.items.form.messages.imageTypeError'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.onerror = () => {
        toast.error(t('products.items.form.messages.imageReadError'));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required dynamic attributes
    const missingRequired = dynamicAttributes
      .filter(attr => attr.required && !attr.value.trim())
      .map(attr => attr.name);
    
    if (missingRequired.length > 0) {
      toast.error(t('products.items.form.messages.requiredAttributes', { names: missingRequired.join(', ') }));
      return;
    }

    setLoading(true);

    try {
      // Convert dynamic attributes to JSON object
      const attributesObj: Record<string, any> = {};
      dynamicAttributes.forEach(attr => {
        if (attr.value) {
          // Convert value based on type
          if (attr.type === 'number') {
            attributesObj[attr.name] = parseFloat(attr.value) || 0;
          } else if (attr.type === 'boolean') {
            attributesObj[attr.name] = attr.value === 'true';
          } else {
            attributesObj[attr.name] = attr.value;
          }
        }
      });
      const attributesJson = Object.keys(attributesObj).length > 0
        ? JSON.stringify(attributesObj)
        : null;

      // Convert temperature controls
      const tempArray = temperatureControls.filter(tc => tc.trim() !== '');
      const temperatureControlJson = tempArray.length > 0
        ? JSON.stringify(tempArray)
        : null;

      const requestData: Partial<Item> = {
        categoryId: formData.categoryId,
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        attributes: attributesJson || undefined,           // keep as JSON string — backend expects String
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? t('products.items.form.editTitle') : t('products.items.form.createTitle')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left & Center Columns - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('products.items.form.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                  >
                    <option value="">{t('products.items.form.selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('products.items.form.sku')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.items.form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={200}
                  placeholder={t('products.items.form.namePlaceholder')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.items.form.description')}
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  placeholder={t('products.items.form.descriptionPlaceholder')}
                />
              </div>

              {/* Dynamic Attributes from Category Schema */}
              {selectedCategory && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('products.items.form.categoryAttributes')}
                    {selectedCategory && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {t('products.items.form.fromCategory', { name: selectedCategory.name })}
                      </span>
                    )}
                  </h3>

                  {dynamicAttributes.length === 0 ? (
                    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">
                        {t('products.items.form.noAttributes')}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {t('products.items.form.editCategoryToAdd')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dynamicAttributes.map((attr, index) => (
                        <div key={index} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {attr.name}
                            {attr.required && <span className="text-red-500 ml-1">*</span>}
                            <span className="text-xs text-gray-500 ml-2">({attr.type})</span>
                          </label>
                          
                          {attr.type === 'boolean' ? (
                            <select
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                            >
                              <option value="">{t('products.items.form.select')}</option>
                              <option value="true">{t('products.items.form.yes')}</option>
                              <option value="false">{t('products.items.form.no')}</option>
                            </select>
                          ) : attr.type === 'number' ? (
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                              step="any"
                              placeholder={t('products.items.form.enterAttribute', { name: attr.name })}
                            />
                          ) : attr.type === 'date' ? (
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                            />
                          ) : (
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={attr.value}
                              onChange={(e) => updateDynamicAttribute(index, e.target.value)}
                              required={attr.required}
                              placeholder={t('products.items.form.enterAttribute', { name: attr.name })}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.items.form.tags')}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  maxLength={500}
                  placeholder={t('products.items.form.tagsPlaceholder')}
                />
              </div>

              {/* Temperature Controls */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('products.items.form.temperatureControls')}
                  </label>
                  <button
                    type="button"
                    onClick={addTemperatureControl}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {t('products.items.form.add')}
                  </button>
                </div>

                {temperatureControls.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">{t('products.items.form.noTemperatureControls')}</p>
                ) : (
                  <div className="space-y-2">
                    {temperatureControls.map((tc, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                          value={tc}
                          onChange={(e) => updateTemperatureControl(index, e.target.value)}
                          placeholder={t('products.items.form.tempControlPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => removeTemperatureControl(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.items.form.shelfLife')}
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) || 0 })}
                  min={0}
                  placeholder={t('products.items.form.shelfLifePlaceholder')}
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.isSerialized}
                    onChange={(e) => setFormData({ ...formData, isSerialized: e.target.checked })}
                  />
                  <span className="text-sm">{t('products.items.form.isSerialized')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.isLotManaged}
                    onChange={(e) => setFormData({ ...formData, isLotManaged: e.target.checked })}
                  />
                  <span className="text-sm">{t('products.items.form.isLotManaged')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                    checked={formData.hazardousMaterial}
                    onChange={(e) => setFormData({ ...formData, hazardousMaterial: e.target.checked })}
                  />
                  <span className="text-sm">{t('products.items.form.hazardousMaterial')}</span>
                </label>
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.items.form.itemImage')}
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">{t('products.items.form.clickToUpload')}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('products.items.form.uploadFormats')}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {t('products.items.form.imageConversion')}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('products.items.form.saving') : (mode === 'edit' ? t('products.items.form.update') : t('products.items.form.create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};