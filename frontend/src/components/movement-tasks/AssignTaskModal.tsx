import { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { MovementTask } from '@/types';
import { movementService } from '@/services/movement.service';
import { toast } from 'react-hot-toast';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: MovementTask | null;
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export const AssignTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  task,
}: AssignTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      // In a real application, this would fetch from a users service
      // For now, we'll use a placeholder
      setUsers([
        { id: '1', username: 'john.doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: '2', username: 'jane.smith', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        { id: '3', username: 'bob.wilson', firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' },
      ]);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error('Please select a user to assign');
      return;
    }

    if (!task) {
      toast.error('No task selected');
      return;
    }

    setLoading(true);
    try {
      await movementService.assignMovementTask(task.id, {
        assignedUserId: selectedUserId,
        notes: notes,
      });
      
      toast.success('Task assigned successfully');
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error('Failed to assign task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Task</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign task to a team member
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Task Information */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Task Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Task Type:</span>
                  <p className="font-medium text-gray-900">{task.taskType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-gray-900">{task.status}</p>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <p className="font-medium text-gray-900">{task.priority}</p>
                </div>
                {task.movement && (
                  <div>
                    <span className="text-gray-600">Movement #:</span>
                    <p className="font-medium text-gray-900">{task.movement.movementNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName} (${user.username})`
                      : user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or instructions for the assignee..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Instructions from Task */}
            {task.instructions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Instructions
                </label>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{task.instructions}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserCheck size={18} />
                  <span>Assign Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};