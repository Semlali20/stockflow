// src/components/categories/CategoryDetailModal.tsx
import React from 'react';
import { X, Edit, Folder, Tag, Calendar, Clock, CheckCircle, Settings, FolderTree, Code } from 'lucide-react';
import { Category } from '@/types';
import { useTranslation } from 'react-i18next';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  onEdit
}) => {
  const { t } = useTranslation();
  if (!isOpen || !category) return null;

  // Parse attribute schemas if they're a string
  let parsedSchemas = null;
  try {
    if (category.attributeSchemas) {
      const parsed = typeof category.attributeSchemas === 'string' 
        ? JSON.parse(category.attributeSchemas) 
        : category.attributeSchemas;
      parsedSchemas = parsed.attributeSchemas || parsed;
    }
  } catch (error) {
    console.error('Error parsing attribute schemas:', error);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <Folder className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={16} className="text-teal-100" />
                  <span className="text-sm font-semibold text-teal-100 uppercase tracking-wider">
                    {t('products.categories.detail.title')}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-1">{category.name}</h2>
                <div className="flex items-center gap-3 text-teal-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {category.isActive ? `● ${t('products.categories.detail.active')}` : `● ${t('products.categories.detail.inactive')}`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {category.description && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Settings size={16} />
                {t('products.categories.detail.description')}
              </h3>
              <p className="text-gray-900 leading-relaxed">{category.description}</p>
            </div>
          )}

          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FolderTree size={14} />
                {t('products.categories.detail.parentCategory')}
              </label>
              <p className="text-lg font-bold text-purple-900">
                {category.parentCategoryId || t('products.categories.form.noneRoot')}
              </p>
            </div>

            {category.displayOrder !== null && category.displayOrder !== undefined && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 hover:border-amber-300 transition-colors">
                <label className="block text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                  {t('products.categories.detail.displayOrder')}
                </label>
                <p className="text-lg font-bold text-amber-900">{category.displayOrder}</p>
              </div>
            )}
          </div>

          {/* Attribute Schemas - Featured Section */}
          {parsedSchemas && Array.isArray(parsedSchemas) && parsedSchemas.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('products.categories.detail.attributeSchemas')}</h3>
                <span className="ml-auto px-3 py-1 bg-indigo-200 text-indigo-900 rounded-full text-xs font-semibold">
                  {t('products.categories.detail.schemasCount', { count: parsedSchemas.length })}
                </span>
              </div>
              
              <div className="space-y-3">
                {parsedSchemas.map((schema: any, index: number) => {
                  const typeColors: Record<string, string> = {
                    string: 'from-blue-400 to-cyan-400',
                    number: 'from-green-400 to-emerald-400',
                    boolean: 'from-purple-400 to-pink-400',
                    date: 'from-orange-400 to-red-400',
                  };
                  const colorClass = typeColors[schema.type] || 'from-gray-400 to-gray-500';
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`} />
                          <h4 className="font-bold text-gray-900 text-lg">{schema.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${colorClass} text-white uppercase`}>
                            {schema.type}
                          </span>
                          {schema.required && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold uppercase">
                              {t('products.categories.detail.required')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          {t('products.categories.detail.type')}: <span className="font-semibold text-gray-700">{schema.type}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          {schema.required ? (
                            <>
                              <span className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="font-semibold text-gray-700">{t('products.categories.detail.mandatory')}</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span className="font-semibold text-gray-700">{t('products.categories.detail.optional')}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* JSON Preview */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-indigo-900 hover:text-indigo-700 flex items-center gap-2 p-3 bg-indigo-100 rounded-lg">
                  <Code size={16} />
                  {t('products.categories.detail.viewJson')}
                </summary>
                <div className="mt-3 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify({ attributeSchemas: parsedSchemas }, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('products.categories.detail.timeline')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={18} className="text-blue-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t('products.categories.detail.created')}
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {category.createdAt ? new Date(category.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock size={18} className="text-purple-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {t('products.categories.detail.lastUpdated')}
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {t('common.close')}
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            <Edit size={18} />
            {t('products.categories.detail.editCategory')}
          </button>
        </div>
      </div>
    </div>
  );
};