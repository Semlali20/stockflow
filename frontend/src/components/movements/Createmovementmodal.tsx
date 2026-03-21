import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { movementService } from '../../services/movement.service';
import { MovementType, MovementPriority } from '../../types';
import { toast } from 'react-hot-toast';

interface CreateMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MovementLine {
  itemId: string;
  requestedQuantity: number;
  uom: string;
  fromLocationId: string;
  toLocationId: string;
  notes: string;
}

const CreateMovementModal: React.FC<CreateMovementModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: MovementType.TRANSFER,
    priority: MovementPriority.NORMAL,
    movementDate: new Date().toISOString().slice(0, 16),
    expectedDate: '',
    scheduledDate: '',
    sourceLocationId: '',
    destinationLocationId: '',
    warehouseId: '',
    referenceNumber: '',
    notes: ''
  });

  const [lines, setLines] = useState<MovementLine[]>([]);
  const [currentLine, setCurrentLine] = useState<MovementLine>({
    itemId: '',
    requestedQuantity: 0,
    uom: 'UNIT',
    fromLocationId: '',
    toLocationId: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouseId.trim()) {
      toast.error('Warehouse ID is required');
      return;
    }

    if (lines.length === 0) {
      toast.error('At least one line is required');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        ...formData,
        movementDate: new Date(formData.movementDate).toISOString(),
        expectedDate: formData.expectedDate ? new Date(formData.expectedDate).toISOString() : null,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
        lines: lines.map(line => ({
          ...line,
          status: 'PENDING'
        }))
      };

      await movementService.createMovement(requestData);
      toast.success('Movement created successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating movement:', error);
      toast.error(error.message || 'Failed to create movement');
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    if (!currentLine.itemId.trim()) {
      toast.error('Item ID is required');
      return;
    }

    if (currentLine.requestedQuantity <= 0) {
      toast.error('Requested quantity must be greater than 0');
      return;
    }

    setLines([...lines, currentLine]);
    setCurrentLine({
      itemId: '',
      requestedQuantity: 0,
      uom: 'UNIT',
      fromLocationId: '',
      toLocationId: '',
      notes: ''
    });
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Movement</h2>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-blue-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {Object.values(MovementType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as MovementPriority })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {Object.values(MovementPriority).map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warehouse ID *
                    </label>
                    <input
                      type="text"
                      value={formData.warehouseId}
                      onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter warehouse ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reference number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Movement Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.movementDate}
                      onChange={(e) => setFormData({ ...formData, movementDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expectedDate}
                      onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Location ID
                    </label>
                    <input
                      type="text"
                      value={formData.sourceLocationId}
                      onChange={(e) => setFormData({ ...formData, sourceLocationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Source location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Location ID
                    </label>
                    <input
                      type="text"
                      value={formData.destinationLocationId}
                      onChange={(e) => setFormData({ ...formData, destinationLocationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Destination location"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any notes or comments..."
                  />
                </div>
              </div>

              {/* Movement Lines */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Movement Lines *</h3>
                
                {/* Add Line Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item ID *
                      </label>
                      <input
                        type="text"
                        value={currentLine.itemId}
                        onChange={(e) => setCurrentLine({ ...currentLine, itemId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item ID"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentLine.requestedQuantity}
                        onChange={(e) => setCurrentLine({ ...currentLine, requestedQuantity: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UOM
                      </label>
                      <input
                        type="text"
                        value={currentLine.uom}
                        onChange={(e) => setCurrentLine({ ...currentLine, uom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="UNIT"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Location
                      </label>
                      <input
                        type="text"
                        value={currentLine.fromLocationId}
                        onChange={(e) => setCurrentLine({ ...currentLine, fromLocationId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="From location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Location
                      </label>
                      <input
                        type="text"
                        value={currentLine.toLocationId}
                        onChange={(e) => setCurrentLine({ ...currentLine, toLocationId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="To location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={currentLine.notes}
                        onChange={(e) => setCurrentLine({ ...currentLine, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Line notes"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addLine}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Line
                  </button>
                </div>

                {/* Lines List */}
                {lines.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Lines ({lines.length})</h4>
                    {lines.map((line, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Item:</span>
                            <span className="ml-2 font-mono">{line.itemId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Qty:</span>
                            <span className="ml-2 font-medium">{line.requestedQuantity} {line.uom}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">From:</span>
                            <span className="ml-2 font-mono">{line.fromLocationId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">To:</span>
                            <span className="ml-2 font-mono">{line.toLocationId || 'N/A'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || lines.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Movement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMovementModal;