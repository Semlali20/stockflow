// src/components/warehouses/WarehouseDetailModal.tsx
import React from 'react';
import { X, Warehouse, Building2, Tag, Calendar, Edit, Settings } from 'lucide-react';

interface WarehouseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: any;
  onEdit?: () => void;
}

export const WarehouseDetailModal: React.FC<WarehouseDetailModalProps> = ({
  isOpen,
  onClose,
  warehouse,
  onEdit
}) => {
  if (!isOpen || !warehouse) return null;

  // Parse settings from JSON string
  const parseSettings = (settingsString: string | null) => {
    if (!settingsString) return null;
    try {
      const parsed = JSON.parse(settingsString);
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: String(value)
      }));
    } catch (e) {
      console.error('Failed to parse settings:', e);
      return null;
    }
  };

  const settings = parseSettings(warehouse.settings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2.5 rounded-lg backdrop-blur-sm">
              <Warehouse className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Warehouse Details</h2>
              <p className="text-blue-100 text-sm mt-0.5">{warehouse.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Warehouse className="text-blue-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Warehouse Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Warehouse Name
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base font-semibold text-gray-900">
                      {warehouse.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Warehouse Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag size={14} />
                    Warehouse Code
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base font-mono font-semibold text-gray-900">
                      {warehouse.code || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Site */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Building2 size={14} />
                    Site
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-900 font-medium">
                      {warehouse.siteName || warehouse.site?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            {settings && settings.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Settings className="text-purple-600" size={20} />
                  Configuration Settings
                </h3>
                <div className="space-y-3">
                  {settings.map((setting, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                          {setting.key}
                        </label>
                        <p className="text-base text-gray-900 break-words">
                          {setting.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Settings State */}
            {(!settings || settings.length === 0) && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Settings className="text-purple-600" size={20} />
                  Configuration Settings
                </h3>
                <div className="text-center py-8">
                  <Settings className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-sm text-gray-500">No configuration settings available</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
         
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-all duration-200 shadow-sm"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Edit size={18} />
              Edit Warehouse
            </button>
          )}
        </div>
      </div>
    </div>
  );
};