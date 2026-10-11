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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full rounded-3xl bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between bg-cream-100/70 dark:bg-cozydark-900/70">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blush-500" />
            <h3 className="font-serif font-semibold text-sm sm:text-base text-cream-900 dark:text-cream-50">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-cream-400 hover:text-cream-700 dark:hover:text-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="p-4 flex-1 flex items-center justify-center bg-cream-100/40 dark:bg-black/30 overflow-hidden">
          <img
            src={imageDataUrl}
            alt="Screenshot Preview"
            className="max-h-[50vh] w-auto max-w-full rounded-2xl object-contain shadow-md border border-cream-200/60 dark:border-cozydark-700"
          />
        </div>

        {/* Caption & Action Bar */}
        <div className="p-3.5 sm:p-4 bg-cream-50 dark:bg-cozydark-850 border-t border-cream-200/80 dark:border-cozydark-750 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-2xl bg-cream-100 dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-blush-400/50"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2.5 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
