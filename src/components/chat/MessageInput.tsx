import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Smile, Sparkles, Film } from 'lucide-react';
import { Message } from '../../types/database';
import { StickerPickerModal } from './StickerPickerModal';
import { GifPickerModal } from './GifPickerModal';
import { encodeStickerMessage } from '../../lib/stickers';
import { encodeGifMessage } from '../../lib/gifs';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const QUICK_EMOJIS = ['🌸', '✨', '💖', '☕', '🍰', '🌿'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
  const [gifModalOpen, setGifModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-2 sm:p-4 bg-cream-50/90 dark:bg-cozydark-900/90 border-t border-cream-200/80 dark:border-cozydark-800/80 backdrop-blur-md">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-2xl bg-blush-50 dark:bg-blush-950/40 border border-blush-200 dark:border-blush-800/60 text-xs animate-slide-up">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-blush-700 dark:text-blush-300 shrink-0">
              Replying to {replyingTo.sender?.display_name || 'Friend'}:
            </span>
            <span className="text-cream-600 dark:text-cream-300 truncate italic">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-cream-400 hover:text-cream-700 dark:hover:text-cream-200 rounded-full shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Bar */}
      <div className="flex items-end gap-1.5 sm:gap-2 bg-cream-100 dark:bg-cozydark-850 p-1.5 rounded-3xl border border-cream-300/80 dark:border-cozydark-800 shadow-sm focus-within:ring-2 focus-within:ring-blush-300/50 dark:focus-within:ring-blush-600/50 transition-all">
        {/* Stickers & GIF Action Buttons */}
        <div className="flex items-center pb-1 pl-1 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setStickerModalOpen(true)}
            className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
            title="Stickers & Custom Stickers"
            aria-label="Open stickers"
          >
            <Sparkles className="w-4 h-4 text-blush-500" />
          </button>

          <button
            type="button"
            onClick={() => setGifModalOpen(true)}
            className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
            title="Search GIFs"
            aria-label="Open GIF picker"
          >
            <Film className="w-4 h-4 text-lavender-500" />
          </button>
        </div>

        {/* Quick Emoji Bar (Desktop) */}
        <div className="hidden md:flex items-center pb-1.5 gap-1 border-l border-cream-200/80 dark:border-cozydark-750 pl-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-sm p-1 rounded-full hover:bg-cream-200 dark:hover:bg-cozydark-750 transition-transform hover:scale-110"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message, share a sticker or GIF..."
          rows={1}
          className="flex-1 bg-transparent px-2.5 py-2 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none resize-none max-h-32"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-2.5 rounded-full bg-blush-500 hover:bg-blush-600 disabled:opacity-40 disabled:hover:bg-blush-500 text-white transition-all shadow-sm shrink-0 flex items-center justify-center transform active:scale-95 mb-0.5"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Stickers Modal */}
      <StickerPickerModal
        isOpen={stickerModalOpen}
        onClose={() => setStickerModalOpen(false)}
        onSelectSticker={(sticker) => {
          onSendMessage(encodeStickerMessage(sticker));
        }}
      />

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={gifModalOpen}
        onClose={() => setGifModalOpen(false)}
        onSelectGif={(gifUrl) => {
          onSendMessage(encodeGifMessage(gifUrl));
        }}
      />
    </div>
  );
};
