import React, { useState } from 'react';
import { Message } from '../../types/database';
import { Avatar } from '../common/Avatar';
import { Reply, Edit2, Trash2, Smile, Check, X, Film, Sparkles, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import { parseStickerMessage } from '../../lib/stickers';
import { parseGifMessage } from '../../lib/gifs';

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  currentUserId: string;
}

const COMMON_EMOJIS = ['🌸', '💖', '☕', '🍰', '✨', '🥺', '🫂', '😂'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMe,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  currentUserId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [gifLightboxOpen, setGifLightboxOpen] = useState(false);

  const stickerInfo = parseStickerMessage(message.content);
  const gifInfo = parseGifMessage(message.content);

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

  const getReplyPreviewText = (content: string) => {
    const s = parseStickerMessage(content);
    if (s.isSticker) return `🏷️ Sticker: ${s.name || 'Custom'}`;
    const g = parseGifMessage(content);
    if (g.isGif) return '🎬 GIF';
    return content;
  };

  // Group reactions by emoji
  const reactionCounts = message.reactions.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userReactedEmojis = new Set(
    message.reactions.filter((r) => r.user_id === currentUserId).map((r) => r.emoji)
  );

  return (
    <div
      className={`group relative flex gap-2.5 sm:gap-3 my-2.5 px-1 sm:px-4 ${
        isMe ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Sender Avatar */}
      <Avatar
        name={message.sender?.display_name || (isMe ? 'Me' : 'Partner')}
        url={message.sender?.avatar_url}
        size="sm"
        className="mt-1 shrink-0"
      />

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name & Time */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-cream-600 dark:text-cream-400">
            {message.sender?.display_name || (isMe ? 'Me' : 'Friend')}
          </span>
          <span className="text-[10px] text-cream-400 dark:text-cream-500">
            {formatMessageTime(message.created_at)}
          </span>
          {message.is_edited && !stickerInfo.isSticker && !gifInfo.isGif && (
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

        {/* Message Content Area */}
        <div className="relative">
          {isEditing ? (
            <div className="p-2 rounded-2xl bg-cream-50 dark:bg-cozydark-850 border border-blush-300 dark:border-blush-700 shadow-sm w-72 sm:w-80">
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
            /* Standard Text Message Bubble */
            <div
              className={`px-4 py-2.5 rounded-2.5xl text-sm leading-relaxed shadow-sm break-words select-text ${
                isMe
                  ? 'bg-gradient-to-br from-blush-200 via-blush-100 to-blush-200/90 text-blush-950 border border-blush-300/60 dark:from-blush-900/80 dark:via-blush-800/70 dark:to-blush-900/80 dark:text-cream-50 dark:border-blush-700/50 rounded-br-sm shadow-xs'
                  : 'bg-white dark:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-700 text-cream-900 dark:text-cream-50 rounded-bl-sm shadow-xs'
              }`}
            >
              {message.content}
            </div>
          )}

          {/* Floating Action Bar */}
          {!isEditing && (
            <div
              className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cream-50 dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 shadow-cozy ${
                isMe ? 'right-full mr-2' : 'left-full ml-2'
              }`}
            >
              {/* Quick Reaction Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-100 dark:hover:bg-cozydark-700 transition-colors"
                title="Add reaction"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {/* Reply Button */}
              <button
                onClick={() => onReply(message)}
                className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-100 dark:hover:bg-cozydark-700 transition-colors"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>

              {/* Edit (only text) & Delete for author */}
              {isMe && (
                <>
                  {!stickerInfo.isSticker && !gifInfo.isGif && (
                    <button
                      onClick={() => {
                        setEditContent(message.content);
                        setIsEditing(true);
                      }}
                      className="p-1 rounded-full text-cream-500 hover:text-blush-500 hover:bg-cream-100 dark:hover:bg-cozydark-700 transition-colors"
                      title="Edit message"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1 rounded-full text-cream-500 hover:text-rose-500 hover:bg-cream-100 dark:hover:bg-cozydark-700 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Quick Floating Emoji Popover */}
          {showEmojiPicker && (
            <div
              className={`absolute bottom-full mb-2 z-20 flex gap-1 p-1.5 rounded-full bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-cozy-lg ${
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
