// src/components/items/ItemDetailModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { X, Edit, Package, Tag, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Thermometer, Image as ImageIcon } from 'lucide-react';
import { Item } from '@/types';
import { useTranslation } from 'react-i18next';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onEdit: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit
}) => {
  const { t } = useTranslation();
  if (!isOpen || !item) return null;

  let parsedAttributes = null;
  try {
    parsedAttributes = typeof item.attributes === 'string'
      ? JSON.parse(item.attributes)
      : item.attributes;
  } catch (error) {
    console.error('Error parsing attributes:', error);
  }

  let parsedTempControls: string[] = [];
  try {
    if (item.temperatureControl) {
      parsedTempControls = typeof item.temperatureControl === 'string'
        ? JSON.parse(item.temperatureControl)
        : item.temperatureControl;
    }
  } catch (error) {
    console.error('Error parsing temperature controls:', error);
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{item.name}</h2>
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="flex items-center gap-1">
                    <Tag size={16} />
                    {item.sku}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.isActive
                      ? `● ${t('products.items.detail.statusActive')}`
                      : `● ${t('products.items.detail.statusInactive')}`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Image */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border-2 border-gray-200 dark:border-neutral-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <ImageIcon size={16} />
                  {t('products.items.detail.productImage')}
                </label>
                {item.imageUrl ? (
                  <div className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('products.items.detail.noImage')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Package size={16} />
                  {t('products.items.detail.quickInfo')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('products.items.detail.serialized')}</span>
                    {item.isSerialized
                      ? <CheckCircle size={18} className="text-green-500" />
                      : <XCircle size={18} className="text-gray-400 dark:text-gray-600" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('products.items.detail.lotManaged')}</span>
                    {item.isLotManaged
                      ? <CheckCircle size={18} className="text-green-500" />
                      : <XCircle size={18} className="text-gray-400 dark:text-gray-600" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('products.items.detail.hazardous')}</span>
                    {item.hazardousMaterial
                      ? <AlertTriangle size={18} className="text-orange-500" />
                      : <XCircle size={18} className="text-gray-400 dark:text-gray-600" />}
                  </div>
                  {item.shelfLifeDays !== undefined && item.shelfLifeDays > 0 && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('products.items.detail.shelfLife')}</span>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                        {t('products.items.detail.shelfLifeValue', { count: item.shelfLifeDays })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {item.description && (
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-neutral-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.items.form.description')}
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{item.description}</p>
                </div>
              )}

              {/* SKU + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border-2 border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('products.items.detail.sku')}
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{item.sku}</p>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border-2 border-gray-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('products.items.detail.category')}
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.categoryName || item.categoryId || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {item.tags && (
                <div className="bg-purple-50 dark:bg-purple-950/40 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <Tag size={16} />
                    {t('products.items.detail.tags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-200 rounded-full text-sm font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Temperature Controls */}
              {parsedTempControls && parsedTempControls.length > 0 && (
                <div className="bg-cyan-50 dark:bg-cyan-950/40 rounded-xl p-4 border-2 border-cyan-200 dark:border-cyan-800">
                  <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-300 mb-3 flex items-center gap-2">
                    <Thermometer size={16} />
                    {t('products.items.detail.temperatureControls')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedTempControls.map((control, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-200 rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        <Thermometer size={14} />
                        {control}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Attributes */}
              {parsedAttributes && Object.keys(parsedAttributes).length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">
                    {t('products.items.detail.customAttributes')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(parsedAttributes).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-neutral-800 rounded-lg p-3 shadow-sm border border-amber-100 dark:border-amber-900">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {key}
                        </label>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={14} />
                      {t('products.items.detail.createdAt')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      {t('products.items.detail.lastUpdated')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-neutral-700 border-2 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors font-medium"
          >
            {t('common.close')}
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            <Edit size={18} />
            {t('products.items.detail.editItem')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
