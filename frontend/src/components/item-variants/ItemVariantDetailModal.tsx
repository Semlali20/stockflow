// src/components/item-variants/ItemVariantDetailModal.tsx
import React from 'react';
import { X, Edit, Layers, Tag, Calendar, Clock, CheckCircle, Package, Sparkles } from 'lucide-react';
import { ItemVariant } from '@/types';
import { useTranslation } from 'react-i18next';

interface ItemVariantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ItemVariant | null;
  onEdit: () => void;
}

export const ItemVariantDetailModal: React.FC<ItemVariantDetailModalProps> = ({
  isOpen,
  onClose,
  variant,
  onEdit
}) => {
  const { t } = useTranslation();
  if (!isOpen || !variant) return null;

  let parsedAttributes = null;
  try {
    parsedAttributes = typeof variant.attributes === 'string'
      ? JSON.parse(variant.attributes)
      : variant.attributes;
  } catch (error) {
    console.error('Error parsing attributes:', error);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-neutral-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={20} className="text-yellow-300" />
                  <span className="text-sm font-semibold text-purple-100 uppercase tracking-wider">
                    {t('products.variants.detail.title')}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-1">{variant.name || t('products.variants.detail.unnamed')}</h2>
                <div className="flex items-center gap-3 text-purple-100">
                  <span className="flex items-center gap-1">
                    <Tag size={16} />
                    {variant.sku}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    variant.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {variant.isActive
                      ? `● ${t('products.variants.detail.activeAvailable')}`
                      : `● ${t('products.variants.detail.inactive')}`}
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

        <div className="p-6 space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-950/40 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
              <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag size={14} />
                {t('products.variants.detail.variantSku')}
              </label>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-200">{variant.sku}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
              <label className="block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Package size={14} />
                {t('products.variants.detail.parentItemId')}
              </label>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{variant.parentItemId || 'N/A'}</p>
            </div>

            {variant.name && (
              <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-800">
                <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  {t('products.variants.detail.variantName')}
                </label>
                <p className="text-xl font-bold text-amber-900 dark:text-amber-200">{variant.name}</p>
              </div>
            )}

            {variant.barcode && (
              <div className="bg-green-50 dark:bg-green-950/40 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                <label className="block text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                  {t('products.variants.detail.barcode')}
                </label>
                <p className="text-xl font-bold text-green-900 dark:text-green-200 font-mono">{variant.barcode}</p>
              </div>
            )}
          </div>

          {/* Attributes */}
          {parsedAttributes && Object.keys(parsedAttributes).length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('products.variants.detail.attributes')}
                </h3>
                <span className="ml-auto px-3 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-full text-xs font-semibold">
                  {t('products.variants.detail.attributesCount', { count: Object.keys(parsedAttributes).length })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(parsedAttributes).map(([key, value], index) => {
                  const colors = [
                    'from-blue-400 to-cyan-400',
                    'from-purple-400 to-pink-400',
                    'from-green-400 to-emerald-400',
                    'from-orange-400 to-red-400',
                    'from-indigo-400 to-purple-400',
                    'from-teal-400 to-cyan-400',
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`} />
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {key}
                        </label>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-gray-600 dark:text-gray-400" />
              {t('products.variants.detail.statusInfo')}
            </h3>
            <div className="flex items-center gap-2">
              {variant.isActive ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('products.variants.detail.activeAvailable')}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('products.variants.detail.inactive')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-5 border border-gray-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {t('products.variants.detail.timeline')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('products.variants.detail.created')}
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {variant.createdAt ? new Date(variant.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t('products.variants.detail.lastUpdated')}
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    {variant.updatedAt ? new Date(variant.updatedAt).toLocaleString() : 'N/A'}
                  </p>
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
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            <Edit size={18} />
            {t('products.variants.detail.editVariant')}
          </button>
        </div>
      </div>
    </div>
  );
};
