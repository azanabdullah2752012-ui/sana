import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Soft Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-cream-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-cream-50 dark:bg-cozydark-900 rounded-3xl border border-cream-200 dark:border-cozydark-800 shadow-cozy-lg dark:shadow-cozy-dark-lg p-6 sm:p-7 overflow-hidden transition-all duration-300 animate-slide-up z-10`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-cream-200/80 dark:border-cozydark-800/80">
          {title && <div className="text-xl font-serif font-medium text-cream-900 dark:text-cream-100">{title}</div>}
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-cream-400 hover:text-cream-700 hover:bg-cream-100 dark:hover:text-cream-200 dark:hover:bg-cozydark-800 transition-colors ml-auto -mr-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[80dvh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
