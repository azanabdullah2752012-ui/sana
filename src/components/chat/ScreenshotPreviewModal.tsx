import React, { useState } from 'react';
import { Send, X, Image as ImageIcon } from 'lucide-react';

interface ScreenshotPreviewModalProps {
  isOpen: boolean;
  imageDataUrl: string;
  onClose: () => void;
  onSend: (imageDataUrl: string, caption: string) => void;
  title?: string;
}

export const ScreenshotPreviewModal: React.FC<ScreenshotPreviewModalProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onSend,
  title = 'Send Screenshot',
}) => {
  const [caption, setCaption] = useState('');

  if (!isOpen || !imageDataUrl) return null;

  const handleSend = () => {
    onSend(imageDataUrl, caption);
    setCaption('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md sm:max-w-lg rounded-3xl bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-2xl flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between bg-cream-100/70 dark:bg-cozydark-900/70 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blush-500" />
            <h3 className="font-serif font-semibold text-sm sm:text-base text-cream-900 dark:text-cream-50">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-cream-400 hover:text-cream-700 dark:hover:text-cream-200 transition-colors"
            aria-label="Close screenshot preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Display: Constrained so the dialog never overflows the screen */}
        <div className="p-3 sm:p-4 flex items-center justify-center bg-cream-100/40 dark:bg-black/30 overflow-hidden">
          <img
            src={imageDataUrl}
            alt="Screenshot Preview"
            className="max-h-[38vh] sm:max-h-[44vh] w-auto max-w-full rounded-2xl object-contain shadow-sm border border-cream-200/60 dark:border-cozydark-700"
          />
        </div>

        {/* Caption & Action Bar: Always anchored & 100% visible */}
        <div className="p-3 sm:p-4 bg-cream-50 dark:bg-cozydark-850 border-t border-cream-200/80 dark:border-cozydark-750 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-cream-100 dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-blush-400/50"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2.5 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
