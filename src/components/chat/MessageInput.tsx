import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Smile, Sparkles, Film, Image as ImageIcon, Mic } from 'lucide-react';
import { Message } from '../../types/database';
import { StickerPickerModal } from './StickerPickerModal';
import { GifPickerModal } from './GifPickerModal';
import { EmojiPickerModal } from './EmojiPickerModal';
import { ScreenshotPreviewModal } from './ScreenshotPreviewModal';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import { encodeStickerMessage } from '../../lib/stickers';
import { encodeGifMessage } from '../../lib/gifs';
import { compressImageFile } from '../../lib/images';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendImageMessage: (imageDataUrl: string, caption?: string) => void;
  onSendVoiceNote: (audioDataUrl: string, durationSec: number) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const QUICK_EMOJIS = ['🌸', '✨', '💖', '☕', '🍰', '🥰', '🥺', '🫂', '😂', '🎉', '🐱', '🧋', '🍓', '🔥'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendImageMessage,
  onSendVoiceNote,
  onTyping,
  replyingTo,
  onCancelReply,
}) => {
  const [content, setContent] = useState('');
  const [stickerModalOpen, setStickerModalOpen] = useState(false);
  const [gifModalOpen, setGifModalOpen] = useState(false);
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);

  // Screenshot / Photo state
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

  // Voice note recording mode
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Handle typing signal with debouncing
  const handleTypingEvent = () => {
    onTyping(true);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = window.setTimeout(() => {
      onTyping(false);
    }, 2500);
  };

  const handleSend = () => {
    if (!content.trim()) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTyping(false);

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
    handleTypingEvent();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTypingEvent();
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // WhatsApp-Style Screenshot Paste from Clipboard (Cmd+V / Ctrl+V)
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const compressed = await compressImageFile(file);
            setScreenshotPreviewUrl(compressed);
            setScreenshotModalOpen(true);
            return;
          } catch (err) {
            console.warn('Screenshot paste compression error:', err);
          }
        }
      }
    }
  };

  // Screenshot / Photo file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        const compressed = await compressImageFile(file);
        setScreenshotPreviewUrl(compressed);
        setScreenshotModalOpen(true);
      } catch (err) {
        console.warn('Image select error:', err);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="p-2 sm:p-3.5 bg-cream-50/90 dark:bg-cozydark-900/90 border-t border-cream-200/80 dark:border-cozydark-800/80 backdrop-blur-md">
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

      {/* If recording voice note, show WhatsApp-style voice recorder bar */}
      {isRecordingAudio ? (
        <VoiceNoteRecorder
          onSendVoiceNote={(audioUrl, duration) => {
            onSendVoiceNote(audioUrl, duration);
            setIsRecordingAudio(false);
          }}
          onCancel={() => setIsRecordingAudio(false)}
        />
      ) : (
        /* Main Input Bar */
        <div className="flex items-end gap-1 sm:gap-2 bg-cream-100 dark:bg-cozydark-850 p-1.5 rounded-3xl border border-cream-300/80 dark:border-cozydark-750 shadow-sm focus-within:ring-2 focus-within:ring-blush-300/50 dark:focus-within:ring-blush-500/40 transition-all">
          
          {/* Action Toolbar: Emoji, Screenshot/Photo, Stickers, GIF */}
          <div className="flex items-center pb-1 pl-1 gap-0.5 shrink-0">
            {/* Full Emoji Picker */}
            <button
              type="button"
              onClick={() => setEmojiModalOpen((prev) => !prev)}
              className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
              title="All Emojis"
              aria-label="Open emoji picker"
            >
              <Smile className="w-4 h-4 text-amber-500" />
            </button>

            {/* Screenshot / Photo Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
              title="Attach screenshot or photo (or paste Cmd+V)"
              aria-label="Attach screenshot or photo"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Stickers */}
            <button
              type="button"
              onClick={() => setStickerModalOpen(true)}
              className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
              title="Stickers"
              aria-label="Open stickers"
            >
              <Sparkles className="w-4 h-4 text-blush-500" />
            </button>

            {/* KLIPY GIFs */}
            <button
              type="button"
              onClick={() => setGifModalOpen(true)}
              className="p-2 rounded-full text-cream-500 dark:text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all active:scale-95"
              title="KLIPY GIFs"
              aria-label="Open GIF picker"
            >
              <Film className="w-4 h-4 text-lavender-500" />
            </button>
          </div>

          {/* Quick Emoji Bar (Desktop & Tablet) */}
          <div className="hidden lg:flex items-center pb-1.5 gap-1 border-l border-cream-200/80 dark:border-cozydark-750 pl-1.5 max-w-[240px] overflow-x-auto no-scrollbar">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-sm p-0.5 rounded-full hover:bg-cream-200 dark:hover:bg-cozydark-750 transition-transform hover:scale-125"
                title={`Add ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Text Area (with onPaste for screenshots!) */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message, paste screenshot (Cmd+V)..."
            rows={1}
            className="flex-1 bg-transparent px-2.5 py-2 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 focus:outline-none resize-none max-h-32"
          />

          {/* WhatsApp Voice Note Mic Button or Send Button */}
          {content.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 rounded-full bg-blush-500 hover:bg-blush-600 text-white transition-all shadow-sm shrink-0 flex items-center justify-center transform active:scale-95 mb-0.5"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecordingAudio(true)}
              className="p-2.5 rounded-full bg-cream-200/80 dark:bg-cozydark-750 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-cream-600 dark:text-cream-300 transition-all shadow-xs shrink-0 flex items-center justify-center transform active:scale-95 mb-0.5"
              title="Record voice note"
              aria-label="Record voice note"
            >
              <Mic className="w-4 h-4 text-rose-500" />
            </button>
          )}
        </div>
      )}

      {/* Floating Anchored WhatsApp Emoji Picker Drawer */}
      {emojiModalOpen && (
        <div className="absolute bottom-full mb-2 left-2 sm:left-4 z-40 animate-slide-up shadow-2xl">
          <EmojiPickerModal
            isOpen={emojiModalOpen}
            onClose={() => setEmojiModalOpen(false)}
            onSelectEmoji={(emoji) => addEmoji(emoji)}
            title="Insert Emoji"
            isPopover={true}
          />
        </div>
      )}

      {/* Screenshot / Photo Preview Modal */}
      <ScreenshotPreviewModal
        isOpen={screenshotModalOpen}
        imageDataUrl={screenshotPreviewUrl || ''}
        onClose={() => {
          setScreenshotModalOpen(false);
          setScreenshotPreviewUrl(null);
        }}
        onSend={(imgUrl, caption) => {
          onSendImageMessage(imgUrl, caption);
          setScreenshotModalOpen(false);
          setScreenshotPreviewUrl(null);
        }}
      />

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
