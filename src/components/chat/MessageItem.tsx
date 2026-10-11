import React, { useState } from 'react';
import { Message } from '../../types/database';
import { Avatar } from '../common/Avatar';
import { Reply, Edit2, Trash2, Smile, Check, X, Maximize2, Download, MoreVertical, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { parseStickerMessage } from '../../lib/stickers';
import { parseGifMessage } from '../../lib/gifs';
import { parseImageMessage } from '../../lib/images';
import { parseAudioMessage } from '../../lib/audio';
import { AudioMessageBubble } from './AudioMessageBubble';
import { EmojiPickerModal } from './EmojiPickerModal';
import { MessageContextMenu } from './MessageContextMenu';

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
  isPartnerOnline?: boolean;
}

const COMMON_EMOJIS = ['🌸', '💖', '☕', '🍰', '✨', '🥺', '🫂', '😂', '🥰', '🔥'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMe,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  currentUserId,
  isPartnerOnline = false,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fullEmojiModalOpen, setFullEmojiModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [gifLightboxOpen, setGifLightboxOpen] = useState(false);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  // WhatsApp-style Right Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  const stickerInfo = parseStickerMessage(message.content);
  const gifInfo = parseGifMessage(message.content);
  const imageInfo = parseImageMessage(message.content);
  const audioInfo = parseAudioMessage(message.content);

  const formatMessageTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCopy = () => {
    try {
      if (imageInfo.isImage) {
        navigator.clipboard.writeText(imageInfo.imageUrl || message.content);
      } else {
        navigator.clipboard.writeText(message.content);
      }
    } catch {
      // Fallback
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const getReplyPreviewText = (content: string) => {
    const img = parseImageMessage(content);
    if (img.isImage) return `📷 Photo ${img.caption ? `: ${img.caption}` : ''}`;
    const aud = parseAudioMessage(content);
    if (aud.isAudio) return '🎤 Voice message';
    const s = parseStickerMessage(content);
    if (s.isSticker) return `🏷️ Sticker: ${s.name || 'Custom'}`;
    const g = parseGifMessage(content);
    if (g.isGif) return '🎬 GIF';
    return content;
  };

  // Group reactions by emoji (defensive fallback against undefined/null)
  const safeReactions = Array.isArray(message.reactions) ? message.reactions : [];
  const reactionCounts = safeReactions.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userReactedEmojis = new Set(
    safeReactions.filter((r) => r.user_id === currentUserId).map((r) => r.emoji)
  );

  const isTextOnly = !stickerInfo.isSticker && !gifInfo.isGif && !imageInfo.isImage && !audioInfo.isAudio;
  const isPending = message.id.startsWith('temp-');

  return (
    <div
      className={`group relative flex gap-2.5 sm:gap-3 my-2.5 px-1 sm:px-3 ${
        isMe ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Sender Avatar */}
      <Avatar
        name={message.sender?.display_name || (isMe ? 'Me' : 'Bestie')}
        url={message.sender?.avatar_url}
        size="sm"
        className="mt-1 shrink-0"
      />

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name & Time & WhatsApp-Style Double Checkmarks */}
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-xs font-medium text-cream-600 dark:text-cream-400">
            {message.sender?.display_name || (isMe ? 'Me' : 'Bestie')}
          </span>
          <span className="text-[10px] text-cream-400 dark:text-cream-500">
            {formatMessageTime(message.created_at)}
          </span>

          {/* WhatsApp Status Checkmarks: Clearly distinguished */}
          {isMe && (
            <span className="inline-flex items-center select-none">
              {isPending ? (
                <span className="text-[10px] text-cream-400" title="Sending...">
                  ⏱
                </span>
              ) : isPartnerOnline ? (
                // WhatsApp Signature Seen Blue Double-Check
                <span
                  className="text-[#34B7F1] font-bold text-xs tracking-tighter"
                  title="Seen by bestie"
                >
                  ✓✓
                </span>
              ) : (
                // Delivered Gray Double-Check
                <span
                  className="text-cream-400 dark:text-cream-500 font-bold text-xs tracking-tighter"
                  title="Delivered"
                >
                  ✓✓
                </span>
              )}
            </span>
          )}

          {message.is_edited && isTextOnly && (
            <span className="text-[10px] italic text-cream-400 dark:text-cream-500">
              (edited)
            </span>
          )}
        </div>

        {/* Reply Context Banner */}
        {message.reply_to && (
          <div
            className={`text-xs px-3 py-1.5 rounded-2xl mb-1 max-w-full truncate border ${
              isMe
                ? 'bg-blush-100/60 dark:bg-blush-950/40 border-blush-200/60 text-blush-800 dark:text-blush-200'
                : 'bg-lavender-100/60 dark:bg-lavender-950/40 border-lavender-200/60 text-lavender-800 dark:text-lavender-200'
            }`}
          >
            <span className="font-semibold">{message.reply_to.sender_name}: </span>
            <span className="opacity-80 italic">{getReplyPreviewText(message.reply_to.content)}</span>
          </div>
        )}

        {/* Message Content Area (with onContextMenu for right-click!) */}
        <div
          className="relative max-w-full"
          onContextMenu={handleContextMenu}
        >
          {isEditing ? (
            <div className="p-2.5 rounded-2.5xl bg-cream-50 dark:bg-cozydark-850 border border-blush-300 dark:border-blush-700 shadow-sm w-72 sm:w-80">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm bg-transparent border-none focus:outline-none resize-none text-cream-900 dark:text-cream-50"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-1.5 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-cream-500 hover:text-cream-700 dark:hover:text-cream-300"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2.5 py-1 rounded-lg bg-blush-500 text-white text-xs font-medium flex items-center gap-1 hover:bg-blush-600 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : imageInfo.isImage && imageInfo.imageUrl ? (
            /* Screenshot / Photo Rendering */
            <div className="flex flex-col gap-1 max-w-[280px] sm:max-w-[360px]">
              <div
                onClick={() => setImageLightboxOpen(true)}
                className="group/img relative rounded-2.5xl overflow-hidden shadow-cozy border border-cream-200/80 dark:border-cozydark-700 bg-cream-100/50 dark:bg-cozydark-850 cursor-pointer hover:border-blush-400 dark:hover:border-blush-600 transition-all active:scale-[0.99]"
                title="Click to view full screenshot (or Right-click for options)"
              >
                <img
                  src={imageInfo.imageUrl}
                  alt={imageInfo.caption || 'Screenshot'}
                  className="w-full h-auto max-h-80 object-cover rounded-2.5xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </div>
              {imageInfo.caption && (
                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words [overflow-wrap:anywhere] ${
                    isMe
                      ? 'bg-gradient-to-br from-blush-200 via-blush-100 to-blush-200/90 text-blush-950 border border-blush-300/60 dark:from-blush-900/80 dark:via-blush-800/70 dark:to-blush-900/80 dark:text-cream-50'
                      : 'bg-white dark:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-700 text-cream-900 dark:text-cream-50'
                  }`}
                >
                  {imageInfo.caption}
                </div>
              )}
            </div>
          ) : audioInfo.isAudio && audioInfo.audioUrl ? (
            /* Voice Note Audio Rendering */
            <AudioMessageBubble
              audioUrl={audioInfo.audioUrl}
              durationSec={audioInfo.durationSec || 0}
              isMe={isMe}
            />
          ) : stickerInfo.isSticker ? (
            /* Custom / Preset Sticker Rendering */
            <div className="group/sticker relative inline-block p-1">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-transparent transition-transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center filter drop-shadow-md">
                <img
                  src={stickerInfo.imageUrl}
                  alt={stickerInfo.name || 'Sticker'}
                  className="w-full h-full object-contain rounded-2xl"
                  loading="lazy"
                />
              </div>
              {stickerInfo.name && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cream-900/80 dark:bg-black/80 text-[10px] text-white font-medium opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xs">
                  {stickerInfo.name}
                </div>
              )}
            </div>
          ) : gifInfo.isGif ? (
            /* Animated KLIPY GIF Rendering */
            <div
              onClick={() => setGifLightboxOpen(true)}
              className="group/gif relative rounded-2xl overflow-hidden shadow-cozy border border-cream-200/80 dark:border-cozydark-700 bg-cream-100/50 dark:bg-cozydark-850 max-w-[260px] sm:max-w-[340px] cursor-pointer hover:border-blush-400 dark:hover:border-blush-600 transition-all active:scale-[0.99]"
              title="Click to view full GIF"
            >
              <img
                src={gifInfo.url}
                alt="KLIPY GIF"
                className="w-full h-auto max-h-72 object-contain rounded-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/gif:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-xs pointer-events-none">
                KLIPY
              </span>
            </div>
          ) : (
            /* Standard Text Message Bubble with guaranteed wrapping */
            <div
              className={`px-4 py-2.5 rounded-2.5xl text-sm leading-relaxed shadow-sm select-text break-words break-all [overflow-wrap:anywhere] max-w-full overflow-hidden ${
                isMe
                  ? 'bg-gradient-to-br from-blush-200 via-blush-100 to-blush-200/90 text-blush-950 border border-blush-300/60 dark:from-blush-900/80 dark:via-blush-800/70 dark:to-blush-900/80 dark:text-cream-50 dark:border-blush-700/50 rounded-br-sm shadow-xs'
                  : 'bg-white dark:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-700 text-cream-900 dark:text-cream-50 rounded-bl-sm shadow-xs'
              }`}
            >
              {message.content}
            </div>
          )}

          {/* Floating Action Pill: Anchored securely above the bubble (NEVER overflows screen edges!) */}
          {!isEditing && (
            <div
              className={`absolute -top-3.5 ${
                isMe ? 'right-2' : 'left-2'
              } opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-cream-50 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-700 shadow-md`}
            >
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onReply(message)}
                className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>

              {isMe && (
                <>
                  {isTextOnly && (
                    <button
                      onClick={() => {
                        setEditContent(message.content);
                        setIsEditing(true);
                      }}
                      className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1 rounded-full text-cream-500 hover:text-rose-500 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Mobile / Clickable More Options */}
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setContextMenu({
                    isOpen: true,
                    x: rect.left,
                    y: rect.bottom + 4,
                  });
                }}
                className="p-1 rounded-full text-cream-500 hover:text-cream-700 dark:hover:text-cream-200 hover:bg-cream-200/70 dark:hover:bg-cozydark-750 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Floating Emoji Popover */}
          {showEmojiPicker && (
            <div
              className={`absolute bottom-full mb-2 z-30 flex items-center gap-1 p-1.5 rounded-full bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-cozy-lg animate-fade-in ${
                isMe ? 'right-0' : 'left-0'
              }`}
            >
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onToggleReaction(message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-cream-200/70 dark:hover:bg-cozydark-750 text-sm transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowEmojiPicker(false);
                  setFullEmojiModalOpen(true);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-cream-200/70 dark:bg-cozydark-750 text-cream-600 dark:text-cream-300 hover:bg-blush-100 hover:text-blush-600 dark:hover:bg-blush-950/60 transition-transform hover:scale-110 text-xs font-bold"
                title="Browse all emojis"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Reaction Badges */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 px-1">
            {Object.entries(reactionCounts).map(([emoji, count]) => {
              const hasReacted = userReactedEmojis.has(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    hasReacted
                      ? 'bg-blush-100 dark:bg-blush-950/70 text-blush-800 dark:text-blush-200 border border-blush-300 dark:border-blush-700 font-semibold'
                      : 'bg-cream-100 dark:bg-cozydark-800 text-cream-700 dark:text-cream-300 border border-cream-200 dark:border-cozydark-700'
                  }`}
                  title={`${count} reaction${count > 1 ? 's' : ''}`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Right-Click Context Menu */}
      <MessageContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ isOpen: false, x: 0, y: 0 })}
        onReply={() => onReply(message)}
        onCopy={handleCopy}
        onEdit={isTextOnly ? () => { setEditContent(message.content); setIsEditing(true); } : undefined}
        onDelete={() => onDelete(message.id)}
        onReact={(emoji) => onToggleReaction(message.id, emoji)}
        onOpenMoreEmojis={() => setFullEmojiModalOpen(true)}
        isMe={isMe}
        canEdit={isTextOnly}
      />

      {/* Full Emoji Picker Modal for reaction */}
      <EmojiPickerModal
        isOpen={fullEmojiModalOpen}
        onClose={() => setFullEmojiModalOpen(false)}
        onSelectEmoji={(emoji) => onToggleReaction(message.id, emoji)}
        title="Add Emoji Reaction"
      />

      {/* Fullscreen Screenshot/Image Lightbox */}
      {imageLightboxOpen && imageInfo.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setImageLightboxOpen(false)}
        >
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <a
              href={imageInfo.imageUrl}
              download="sanctuary-screenshot.jpg"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setImageLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={imageInfo.imageUrl}
              alt="Screenshot Fullview"
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/10"
            />
            {imageInfo.caption && (
              <p className="text-white/90 text-sm mt-3 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                {imageInfo.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* KLIPY GIF Fullscreen Lightbox */}
      {gifLightboxOpen && gifInfo.url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setGifLightboxOpen(false)}
        >
          <button
            onClick={() => setGifLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-3xl max-h-[90vh] flex flex-col items-center">
            <img
              src={gifInfo.url}
              alt="KLIPY GIF"
              className="max-h-[82vh] w-auto rounded-2xl shadow-2xl object-contain"
            />
            <span className="text-white/80 font-mono text-xs mt-3 uppercase tracking-wider">
              KLIPY GIF • Tap anywhere to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
