import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { Avatar } from '../common/Avatar';
import { Heart, Sparkles, MessageSquare, Coffee, Lock } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const { user, profile, partnerProfile, isPartnerOnline } = useAuth();
  const {
    messages,
    loading,
    error,
    replyingTo,
    setReplyingTo,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    messagesEndRef,
    scrollToBottom,
  } = useChat();

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-2 sm:mx-auto rounded-2xl sm:rounded-3xl bg-cream-50/70 dark:bg-cozydark-900/70 border border-cream-200/80 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-cream-100/90 dark:bg-cozydark-850/90 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar
            name={partnerProfile?.display_name || 'Friend'}
            url={partnerProfile?.avatar_url}
            size="md"
            showStatus={true}
            isOnline={isPartnerOnline}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-semibold text-base text-cream-900 dark:text-cream-50">
                {partnerProfile?.display_name || 'Partner'} &amp; {profile?.display_name || 'You'}
              </h2>
              <Heart className="w-3.5 h-3.5 fill-blush-400 text-blush-400" />
            </div>
            {isPartnerOnline ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active now 🌸 • End-to-End Private</span>
              </p>
            ) : (
              <p className="text-xs text-cream-500 dark:text-cream-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cream-400 dark:bg-cozydark-600" />
                <span>Offline • End-to-End Private</span>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
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
              Leave a gentle note, share a thought from today, or ask Sana how her coffee was!
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
            <div className="text-center py-4 mb-2">
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

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input Bar */}
      <MessageInput
        onSendMessage={sendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};
