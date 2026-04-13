
import { X } from 'lucide-react';
import { MovementLine } from '@/types';

interface MovementLineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  line: MovementLine | null;
}

export const MovementLineDetailModal = ({
  isOpen,
  onClose,
  line,
}: MovementLineDetailModalProps) => {
  if (!isOpen || !line) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculateVariance = () => {
    if (line.actualQuantity !== undefined && line.requestedQuantity !== undefined) {
      return line.actualQuantity - line.requestedQuantity;
    }
    return 0;
  };

  const variance = calculateVariance();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Movement Line Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Line #{line.lineNumber} | ID: {line.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(line.status)}`}>
                {line.status}
              </span>
            </div>

            {/* Movement Information */}
            {line.movement && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Movement Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Movement #:</span>
                    <p className="font-medium text-gray-900">{line.movement.movementNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Movement Type:</span>
                    <p className="font-medium text-gray-900">{line.movement.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Movement Status:</span>
                    <p className="font-medium text-gray-900">{line.movement.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Item Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Item Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Item ID:</span>
                  <p className="font-medium text-gray-900">{line.itemId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Unit of Measure:</span>
                  <p className="font-medium text-gray-900">{line.uom || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Quantity Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Quantity Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Requested Quantity
                  </label>
                  <p className="text-2xl font-bold text-blue-600">
                    {line.requestedQuantity} {line.uom || ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Actual Quantity
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {line.actualQuantity !== undefined ? `${line.actualQuantity} ${line.uom || ''}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Variance
                  </label>
                  <p className={`text-2xl font-bold ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {variance > 0 ? '+' : ''}{variance} {line.uom || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-2 gap-4">
              {line.fromLocationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Location
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900 font-medium">{line.fromLocationId}</p>
                  </div>
                </div>
              )}
              {line.toLocationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Location
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-gray-900 font-medium">{line.toLocationId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lot & Serial Information */}
            <div className="grid grid-cols-2 gap-4">
              {line.lotId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Number
                  </label>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-gray-900 font-medium">{line.lotId}</p>
                  </div>
                </div>
              )}
              {line.serialId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-gray-900 font-medium">{line.serialId}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reason */}
            {line.reason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-gray-900">{line.reason}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {line.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{line.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <p className="text-gray-900">
                  {line.createdAt ? new Date(line.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <p className="text-gray-900">
                  {line.updatedAt ? new Date(line.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};