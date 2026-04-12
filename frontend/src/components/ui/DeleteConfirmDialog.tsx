// src/components/ui/DeleteConfirmDialog.tsx

import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: DeleteConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div
          className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(225,29,72,0.08) 100%)',
            border: '1px solid rgba(244,63,94,0.20)',
            boxShadow: '0 4px 16px rgba(244,63,94,0.15)',
          }}
        >
          <AlertTriangle className="h-6 w-6 text-danger" strokeWidth={2.5} />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
