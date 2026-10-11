import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types/database';

export function useChat() {
  const { user, profile, isApproved } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // 1. Load messages from Supabase
  const fetchMessages = useCallback(async () => {
    if (!isApproved) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch messages with reactions
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
          reactions: m.reactions || [],
        };
      });

      setMessages(enrichedMessages);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [isApproved]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Setup Realtime Listener
  useEffect(() => {
    if (!isApproved) return;

    // Supabase Realtime channel
    const channel = supabase
      .channel('messages_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchMessages]);

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !profile || !isApproved) return;

    const trimmed = content.trim();

    try {
      const { error: sendError } = await supabase.from('messages').insert({
        conversation_id: '00000000-0000-0000-0000-000000000001',
        sender_id: user.id,
        content: trimmed,
        reply_to_id: replyingTo?.id || null,
      });

      if (sendError) throw sendError;

      setReplyingTo(null);
      await fetchMessages();
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  // Edit an existing message
  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim() || !user) return;

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
      setEditingMessage(null);
      await fetchMessages();
    } catch (err: any) {
      console.error('Failed to edit message:', err);
      setError(err.message || 'Failed to edit message');
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error: delError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (delError) throw delError;
      await fetchMessages();
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      setError(err.message || 'Failed to delete message');
    }
  };

  // Toggle emoji reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
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
      await fetchMessages();
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
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    messagesEndRef,
    scrollToBottom,
  };
}
