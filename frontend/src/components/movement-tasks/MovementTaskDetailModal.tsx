
import { X } from 'lucide-react';
import { MovementTask } from '@/types';
import { format } from 'date-fns';

interface MovementTaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: MovementTask | null;
}

export const MovementTaskDetailModal = ({
  isOpen,
  onClose,
  task,
}: MovementTaskDetailModalProps) => {
  if (!isOpen || !task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Movement Task Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Task ID: {task.id}
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
            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <p className="text-gray-900 font-medium">{task.taskType}</p>
            </div>

            {/* Movement Information */}
            {task.movement && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Movement Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Movement #:</span>
                    <p className="font-medium text-gray-900">{task.movement.movementNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Movement Type:</span>
                    <p className="font-medium text-gray-900">{task.movement.type}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <p className="text-gray-900">
                  {task.assignedTo ? task.assignedTo : 'Not assigned'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <p className="text-gray-900">
                  {task.locationId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Start
                </label>
                <p className="text-gray-900">
                  {task.scheduledStartTime 
                    ? format(new Date(task.scheduledStartTime), 'MMM dd, yyyy HH:mm')
                    : 'Not scheduled'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Completion
                </label>
                <p className="text-gray-900">
                  {task.expectedCompletionTime
                    ? format(new Date(task.expectedCompletionTime), 'MMM dd, yyyy HH:mm')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Completion
                </label>
                <p className="text-gray-900">
                  {task.actualCompletionTime
                    ? format(new Date(task.actualCompletionTime), 'MMM dd, yyyy HH:mm')
                    : 'Not completed'}
                </p>
              </div>
            </div>

            {/* Instructions */}
            {task.instructions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{task.instructions}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{task.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <p className="text-gray-900">
                  {task.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <p className="text-gray-900">
                  {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
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