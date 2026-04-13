// src/components/ui/Modal.tsx

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{
        background: 'rgba(7, 5, 17, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      {/* Inner glow ring */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 my-8 rounded-2xl animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900"
          style={{
            border: '1px solid rgba(79, 70, 229, 0.12)',
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.14), 0 32px 80px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 bg-neutral-50/60 dark:bg-neutral-800/60"
            style={{
              borderBottom: '1px solid rgba(79, 70, 229, 0.10)',
            }}
          >
            <h3
              className="text-lg font-bold text-neutral-900 dark:text-white"
              style={{ fontFamily: 'Syne, system-ui, sans-serif', letterSpacing: '-0.02em' }}
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-neutral-800 transition-all duration-150 hover:scale-110 active:scale-90"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
