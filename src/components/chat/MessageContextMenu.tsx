import React, { useEffect, useRef } from 'react';
import { Reply, Copy, Edit2, Trash2, Check } from 'lucide-react';

interface MessageContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact: (emoji: string) => void;
  onOpenMoreEmojis: () => void;
  isMe: boolean;
  canEdit: boolean;
}

const QUICK_CONTEXT_EMOJIS = ['🌸', '💖', '😂', '🥰', '🥺', '👍', '🔥'];

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  onReply,
  onCopy,
  onEdit,
  onDelete,
  onReact,
  onOpenMoreEmojis,
  isMe,
  canEdit,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Keep menu within viewport bounds
  const menuWidth = 220;
  const menuHeight = 240;
  const safeX = Math.min(Math.max(10, x), window.innerWidth - menuWidth - 10);
  const safeY = Math.min(Math.max(10, y), window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ left: safeX, top: safeY }}
      className="fixed z-50 w-52 sm:w-56 rounded-2.5xl bg-cream-50/95 dark:bg-cozydark-850/95 border border-cream-200 dark:border-cozydark-750 shadow-2xl backdrop-blur-md py-1.5 animate-slide-up select-none"
    >
      {/* Quick Reaction Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-cream-200/60 dark:border-cozydark-750 gap-0.5">
        {QUICK_CONTEXT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
            className="w-6 h-6 flex items-center justify-center text-sm rounded-lg hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-transform hover:scale-125"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => {
            onClose();
            onOpenMoreEmojis();
          }}
          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-cream-600 dark:text-cream-300 rounded-lg hover:bg-blush-100 dark:hover:bg-blush-950/60 hover:text-blush-600 transition-transform hover:scale-110"
          title="More emojis"
        >
          +
        </button>
      </div>

      {/* Menu Action Items */}
      <div className="p-1 space-y-0.5 text-xs text-cream-800 dark:text-cream-100">
        <button
          onClick={() => {
            onReply();
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors text-left"
        >
          <Reply className="w-3.5 h-3.5 text-cream-500" />
          <span>Reply</span>
        </button>

        <button
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors text-left"
        >
          <Copy className="w-3.5 h-3.5 text-cream-500" />
          <span>Copy message</span>
        </button>

        {isMe && canEdit && onEdit && (
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-cream-500" />
            <span>Edit</span>
          </button>
        )}

        {isMe && onDelete && (
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-rose-100/70 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
