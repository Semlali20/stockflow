// src/components/sites/SiteDetailModal.tsx
import React from 'react';
import { X, Building2, MapPin, Clock, Calendar, Edit, Tag } from 'lucide-react';

interface SiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: any;
  onEdit?: () => void;
}

export const SiteDetailModal: React.FC<SiteDetailModalProps> = ({
  isOpen,
  onClose,
  site,
  onEdit
}) => {
  if (!isOpen || !site) return null;

  // Format the site type for display
  const formatSiteType = (type: string) => {
    if (!type) return 'N/A';
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get color for site type badge
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      WAREHOUSE: 'bg-blue-100 text-blue-800 border-blue-200',
      DISTRIBUTION_CENTER: 'bg-purple-100 text-purple-800 border-purple-200',
      STORE: 'bg-green-100 text-green-800 border-green-200',
      MANUFACTURING: 'bg-orange-100 text-orange-800 border-orange-200',
      PICKING: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      STAGING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SHIPPING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      QUARANTINE: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2.5 rounded-lg backdrop-blur-sm">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Site Details</h2>
              <p className="text-indigo-100 text-sm mt-0.5">{site.name}</p>
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
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Site Name
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base font-semibold text-gray-900">
                      {site.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Site Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag size={14} />
                    Site Type
                  </label>
                  <div className="flex items-center h-[52px]">
                    <span className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold border ${getTypeColor(site.type)}`}>
                      {formatSiteType(site.type)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Configuration */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="text-purple-600" size={20} />
                Location & Configuration
              </h3>
              <div className="space-y-5">
                {/* Timezone */}
                {site.timezone && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Clock size={14} />
                      Timezone
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="text-base text-gray-900 font-medium">
                        {site.timezone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {site.address && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Address
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {site.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Show message if no location data */}
                {!site.timezone && !site.address && (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-sm text-gray-500">No location or configuration data available</p>
                  </div>
                )}
              </div>
            </div>

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
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Edit size={18} />
              Edit Site
            </button>
          )}
        </div>
      </div>
    </div>
  );
};