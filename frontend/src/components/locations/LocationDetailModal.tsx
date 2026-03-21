// src/components/locations/LocationDetailModal.tsx
import React from 'react';
import { X, MapPinned, Warehouse, Grid3x3, Calendar, Edit, Box, Tag, AlertCircle, Navigation } from 'lucide-react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: any;
  onEdit?: () => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  isOpen,
  onClose,
  location,
  onEdit
}) => {
  if (!isOpen || !location) return null;

  // Format the location type for display
  const formatLocationType = (type: string) => {
    if (!type) return 'N/A';
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get color for location type badge
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RECEIVING: 'bg-blue-100 text-blue-800 border-blue-200',
      STORAGE: 'bg-green-100 text-green-800 border-green-200',
      PICKING: 'bg-purple-100 text-purple-800 border-purple-200',
      STAGING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SHIPPING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      QUARANTINE: 'bg-red-100 text-red-800 border-red-200',
      MANUFACTURING: 'bg-orange-100 text-orange-800 border-orange-200',
      RETURNS: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Check if any position fields are filled
  const hasPositionData = location.zone || location.aisle || location.rack || location.level || location.bin;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2.5 rounded-lg backdrop-blur-sm">
              <MapPinned className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Location Details</h2>
              <p className="text-emerald-100 text-sm mt-0.5">{location.code}</p>
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
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <MapPinned className="text-emerald-600" size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag size={14} />
                    Location Code
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base font-mono font-semibold text-gray-900">
                      {location.code || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Location Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Location Type
                  </label>
                  <div className="flex items-center h-[52px]">
                    <span className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold border ${getTypeColor(location.type)}`}>
                      {formatLocationType(location.type)}
                    </span>
                  </div>
                </div>

                {/* Warehouse */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Warehouse size={14} />
                    Warehouse
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-900 font-medium">
                      {location.warehouseName || location.warehouse?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Structure / Position Grid */}
            {hasPositionData && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <Grid3x3 className="text-teal-600" size={20} />
                  Location Structure
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Zone */}
                  {location.zone && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                        Zone
                      </label>
                      <p className="text-2xl font-bold text-blue-900">{location.zone}</p>
                    </div>
                  )}
                  
                  {/* Aisle */}
                  {location.aisle && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <label className="block text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                        Aisle
                      </label>
                      <p className="text-2xl font-bold text-purple-900">{location.aisle}</p>
                    </div>
                  )}
                  
                  {/* Rack */}
                  {location.rack && (
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                      <label className="block text-xs font-semibold text-pink-700 uppercase tracking-wider mb-2">
                        Rack
                      </label>
                      <p className="text-2xl font-bold text-pink-900">{location.rack}</p>
                    </div>
                  )}
                  
                  {/* Level */}
                  {location.level && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <label className="block text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                        Level
                      </label>
                      <p className="text-2xl font-bold text-orange-900">{location.level}</p>
                    </div>
                  )}
                  
                  {/* Bin */}
                  {location.bin && (
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                      <label className="block text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-2">
                        Bin
                      </label>
                      <p className="text-2xl font-bold text-cyan-900">{location.bin}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Box className="text-purple-600" size={20} />
                Additional Information
              </h3>
              <div className="space-y-5">
                {/* Capacity */}
                {location.capacity && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Capacity
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="text-base text-gray-900 font-medium">
                        {location.capacity}
                      </p>
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                {location.coordinates && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Navigation size={14} />
                      Coordinates
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                      <p className="text-base text-gray-900 font-medium">
                        {location.coordinates}
                      </p>
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {location.restrictions && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle size={14} />
                      Restrictions
                    </label>
                    <div className="bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {location.restrictions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Show message if no additional data */}
                {!location.capacity && !location.coordinates && !location.restrictions && (
                  <div className="text-center py-8">
                    <Box className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-sm text-gray-500">No additional information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Calendar className="text-gray-600" size={20} />
                Record Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Created
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-sm text-gray-900">
                      {location.createdAt || location.created_at
                        ? new Date(location.createdAt || location.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Last Updated
                  </label>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-sm text-gray-900">
                      {location.updatedAt || location.updated_at
                        ? new Date(location.updatedAt || location.updated_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Edit size={18} />
              Edit Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};