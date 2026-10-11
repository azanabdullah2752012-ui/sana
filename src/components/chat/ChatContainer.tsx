import React, { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { Avatar } from '../common/Avatar';
import { Sparkles, Coffee, Lock, Image as ImageIcon } from 'lucide-react';
import { ScreenshotPreviewModal } from './ScreenshotPreviewModal';
import { compressImageFile } from '../../lib/images';

export const ChatContainer: React.FC = () => {
  const { user, profile, partnerProfile, isPartnerOnline } = useAuth();
  const {
    messages,
    loading,
    error,
    replyingTo,
    setReplyingTo,
    isPartnerTyping,
    sendTypingSignal,
    sendMessage,
    sendImageMessage,
    sendVoiceNote,
    editMessage,
    deleteMessage,
    toggleReaction,
    messagesEndRef,
    scrollToBottom,
  } = useChat();

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedImageUrl, setDroppedImageUrl] = useState<string | null>(null);
  const [dropModalOpen, setDropModalOpen] = useState(false);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, isPartnerTyping, scrollToBottom]);

  // Drag and drop screenshot / photo onto chat
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      try {
        const compressed = await compressImageFile(files[0]);
        setDroppedImageUrl(compressed);
        setDropModalOpen(true);
      } catch (err) {
        console.warn('Drop image error:', err);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-2 sm:mx-auto rounded-2xl sm:rounded-3xl bg-cream-50/70 dark:bg-cozydark-900/70 border border-cream-200/80 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark overflow-hidden"
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 bg-blush-500/20 dark:bg-blush-950/60 backdrop-blur-xs border-2 border-dashed border-blush-400 flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-blush-500 text-white flex items-center justify-center shadow-lg mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50">
            Drop screenshot or photo here
          </h3>
          <p className="text-xs text-cream-600 dark:text-cream-300 mt-1">
            We will preview it before sending to your bestie 🌸
          </p>
        </div>
      )}

      {/* Chat Header */}
      <div className="px-4 sm:px-5 py-3.5 bg-cream-100/90 dark:bg-cozydark-850/90 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar
            name={partnerProfile?.display_name || 'Bestie'}
            url={partnerProfile?.avatar_url}
            size="md"
            showStatus={true}
            isOnline={isPartnerOnline}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-semibold text-sm sm:text-base text-cream-900 dark:text-cream-50">
                {partnerProfile?.display_name || 'Bestie'} &amp; {profile?.display_name || 'You'}
              </h2>
              <Sparkles className="w-3.5 h-3.5 text-blush-400" />
            </div>

            {/* Status or WhatsApp Typing Indicator in Header */}
            {isPartnerTyping ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>typing... 💬</span>
              </p>
            ) : isPartnerOnline ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active now ✨ • Private</span>
              </p>
            ) : (
              <p className="text-xs text-cream-500 dark:text-cream-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cream-400 dark:bg-cozydark-600" />
                <span>Offline • Private</span>
              </p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-cream-500 dark:text-cream-400 bg-cream-200/60 dark:bg-cozydark-800 px-3 py-1 rounded-full border border-cream-200 dark:border-cozydark-700">
          <Lock className="w-3 h-3 text-blush-500" />
          <span>RLS Protected</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-cream-400 dark:text-cream-500 gap-2">
            <span className="w-6 h-6 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-serif">Opening our conversation nook...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 text-cream-500 dark:text-cream-400 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-blush-500/15 dark:bg-blush-500/25 border border-blush-500/30 flex items-center justify-center mb-4 text-blush-500 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-medium text-cream-900 dark:text-cream-100 mb-1">
              Quiet &amp; Peaceful Here
            </h3>
            <p className="text-xs max-w-xs text-cream-600 dark:text-cream-400 mb-4 font-light">
              Leave a gentle note, paste a screenshot (Cmd+V), share a voice note, or send a sticker!
            </p>
            <button
              onClick={() => sendMessage('Thinking of you! Hope you have a wonderful cozy day ☕🌸')}
              className="px-5 py-2.5 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium shadow-cozy hover:shadow-cozy-lg transition-all transform active:scale-95"
            >
              "Thinking of you! Hope you have a wonderful day ☕🌸"
            </button>
          </div>
        ) : (
          <>
            {/* Friendly Top Welcome Banner */}
            <div className="text-center py-3 mb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200/60 dark:bg-cozydark-800 text-[11px] text-cream-600 dark:text-cream-400">
                <Coffee className="w-3 h-3 text-blush-500" />
                <span>Beginning of your shared conversation</span>
              </div>
            </div>

            {/* Render Messages */}
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isMe={message.sender_id === user?.id}
                currentUserId={user?.id || ''}
                onReply={(msg) => setReplyingTo(msg)}
                onEdit={editMessage}
                onDelete={deleteMessage}
                onToggleReaction={toggleReaction}
              />
            ))}

            {/* WhatsApp-Style Realtime Typing Bubble */}
            {isPartnerTyping && (
              <div className="flex items-center gap-2.5 my-2 px-1 sm:px-3 animate-slide-up">
                <Avatar
                  name={partnerProfile?.display_name || 'Bestie'}
                  url={partnerProfile?.avatar_url}
                  size="sm"
                  className="mt-1 shrink-0"
                />
                <div className="px-4 py-2.5 rounded-2.5xl rounded-bl-xs bg-white dark:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-700 shadow-xs flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blush-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blush-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blush-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-cream-600 dark:text-cream-400 italic">
                    {partnerProfile?.display_name || 'Bestie'} is typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input Bar */}
      <MessageInput
        onSendMessage={sendMessage}
        onSendImageMessage={sendImageMessage}
        onSendVoiceNote={sendVoiceNote}
        onTyping={sendTypingSignal}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Dropped Screenshot Preview Modal */}
      <ScreenshotPreviewModal
        isOpen={dropModalOpen}
        imageDataUrl={droppedImageUrl || ''}
        onClose={() => {
          setDropModalOpen(false);
          setDroppedImageUrl(null);
        }}
        onSend={(imgUrl, caption) => {
          sendImageMessage(imgUrl, caption);
          setDropModalOpen(false);
          setDroppedImageUrl(null);
        }}
        title="Send Dropped Image"
      />
    </div>
  );
};
