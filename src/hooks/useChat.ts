import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types/database';
import { encodeImageMessage } from '../lib/images';
import { encodeAudioMessage } from '../lib/audio';

export function useChat() {
  const { user, profile, partnerProfile, isApproved } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialFetchDone = useRef<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const realtimeChannelRef = useRef<any>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Load messages from Supabase (silent update by default, NO loader flash)
  const fetchMessages = useCallback(
    async (isInitial = false) => {
      if (!isApproved) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // ONLY show loading state on very first mount if we have no messages yet
      if (isInitial && !initialFetchDone.current) {
        setLoading(true);
      }

      try {
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(*),
            reactions:message_reactions(*)
          `)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        // Populate reply information if applicable
        const messageMap = new Map<string, any>((messagesData || []).map((m) => [m.id, m]));
        const enrichedMessages: Message[] = (messagesData || []).map((m: any) => {
          let replyData = null;
          if (m.reply_to_id && messageMap.has(m.reply_to_id)) {
            const parent = messageMap.get(m.reply_to_id);
            replyData = {
              id: parent.id,
              sender_name: parent.sender?.display_name || 'Friend',
              content: parent.content,
            };
          }
          return {
            ...m,
            reply_to: replyData,
            reactions: Array.isArray(m.reactions) ? m.reactions : [],
          };
        });

        setMessages(enrichedMessages);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        initialFetchDone.current = true;
        setLoading(false);
      }
    },
    [isApproved]
  );

  // Initial load once on mount
  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // Setup Realtime Listener - silent background refresh & typing broadcast
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('messages_realtime_channel', {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchMessages(false);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          fetchMessages(false);
        }
      )
      // WhatsApp-style typing indicator broadcast
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload && payload.userId && payload.userId !== user?.id) {
          const isTyping = Boolean(payload.isTyping);
          setIsPartnerTyping(isTyping);

          // Clear any active timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          // If partner is typing, automatically clear after 3.5 seconds of silence
          if (isTyping) {
            typingTimeoutRef.current = window.setTimeout(() => {
              setIsPartnerTyping(false);
            }, 3500);
          }
        }
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [isApproved, fetchMessages, user?.id]);

  // Broadcast typing signal to partner
  const sendTypingSignal = useCallback(
    (isTyping: boolean) => {
      if (!user || !realtimeChannelRef.current) return;
      try {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            userId: user.id,
            displayName: profile?.display_name || 'Bestie',
            isTyping,
          },
        });
      } catch (err) {
        // Non-critical realtime signal
      }
    },
    [user, profile?.display_name]
  );

  // Send a new message with instant optimistic UI update (0ms lag, no reload)
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !profile || !isApproved) return;

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}`;

    // Clear typing state immediately when sending
    sendTypingSignal(false);

    // 1. Optimistic message added to local state immediately
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: '00000000-0000-0000-0000-000000000001',
      sender_id: user.id,
      content: trimmed,
      reply_to_id: replyingTo?.id || null,
      reply_to: replyingTo
        ? {
            id: replyingTo.id,
            sender_name: replyingTo.sender?.display_name || 'Bestie',
            content: replyingTo.content,
          }
        : null,
      is_edited: false,
      created_at: new Date().toISOString(),
      sender: profile,
      reactions: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setReplyingTo(null);

    // Scroll smoothly to bottom right away
    setTimeout(() => scrollToBottom(true), 10);

    try {
      const { error: sendError } = await supabase.from('messages').insert({
        conversation_id: '00000000-0000-0000-0000-000000000001',
        sender_id: user.id,
        content: trimmed,
        reply_to_id: replyingTo?.id || null,
      });

      if (sendError) throw sendError;

      // Silent sync in background to confirm ID without showing any loader
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      // Rollback optimistic message on network error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  // Send screenshot or photo message
  const sendImageMessage = async (imageDataUrl: string, caption?: string) => {
    if (!imageDataUrl) return;
    const encoded = encodeImageMessage(imageDataUrl, caption);
    await sendMessage(encoded);
  };

  // Send voice note message
  const sendVoiceNote = async (audioDataUrl: string, durationSec: number) => {
    if (!audioDataUrl) return;
    const encoded = encodeAudioMessage(audioDataUrl, durationSec);
    await sendMessage(encoded);
  };

  // Edit an existing message
  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim() || !user) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent.trim(), is_edited: true, edited_at: new Date().toISOString() }
          : m
      )
    );
    setEditingMessage(null);

    try {
      const { error: editError } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (editError) throw editError;
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Failed to edit message:', err);
      setError(err.message || 'Failed to edit message');
      await fetchMessages(false);
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      const { error: delError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (delError) throw delError;
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      setError(err.message || 'Failed to delete message');
      await fetchMessages(false);
    }
  };

  // Toggle emoji reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });
      }
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
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
  };
}
