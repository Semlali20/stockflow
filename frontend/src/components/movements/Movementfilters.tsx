import React from 'react';
import { X } from 'lucide-react';
import { MovementType, MovementStatus, MovementPriority } from '../../types';

interface MovementFiltersProps {
  filters: {
    type: MovementType | '';
    status: MovementStatus | '';
    priority: MovementPriority | '';
    warehouseId: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const MovementFilters: React.FC<MovementFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const handleChange = (field: string, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const hasActiveFilters = () => {
    return filters.type || filters.status || filters.priority || 
           filters.warehouseId || filters.startDate || filters.endDate;
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Movement Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Types</option>
            {Object.values(MovementType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            {Object.values(MovementStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Priorities</option>
            {Object.values(MovementPriority).map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        {/* Warehouse Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse ID
          </label>
          <input
            type="text"
            value={filters.warehouseId}
            onChange={(e) => handleChange('warehouseId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter warehouse ID"
          />
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {filters.type}
                <button
                  onClick={() => handleChange('type', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filters.status}
                <button
                  onClick={() => handleChange('status', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Priority: {filters.priority}
                <button
                  onClick={() => handleChange('priority', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.warehouseId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Warehouse: {filters.warehouseId}
                <button
                  onClick={() => handleChange('warehouseId', '')}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                From: {filters.startDate}
                <button
                  onClick={() => handleChange('startDate', '')}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                To: {filters.endDate}
                <button
                  onClick={() => handleChange('endDate', '')}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementFilters;