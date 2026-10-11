import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Message, MessageReaction } from '../types/database';
import { INITIAL_MOCK_MESSAGES } from '../lib/mockData';

const MOCK_STORAGE_KEY = 'sana_mock_messages';

export function useChat() {
  const { user, profile, partnerProfile, isApproved, isMockMode } = useAuth();
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

  // 1. Load messages from Supabase or Mock Storage
  const fetchMessages = useCallback(async () => {
    if (!isApproved) {
      setMessages([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch {
          setMessages(INITIAL_MOCK_MESSAGES);
        }
      } else {
        setMessages(INITIAL_MOCK_MESSAGES);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MESSAGES));
      }
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
  }, [isApproved, isMockMode]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Setup Realtime or Mock Listener
  useEffect(() => {
    if (!isApproved) return;

    if (isMockMode) {
      const handleCustomEvent = (e: StorageEvent | CustomEvent) => {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) {
          try {
            setMessages(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      };

      window.addEventListener('sana_chat_updated', handleCustomEvent as EventListener);
      window.addEventListener('storage', handleCustomEvent);
      return () => {
        window.removeEventListener('sana_chat_updated', handleCustomEvent as EventListener);
        window.removeEventListener('storage', handleCustomEvent);
      };
    }

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
  }, [isApproved, isMockMode, fetchMessages]);

  // Save helper for mock mode
  const saveMockMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newMessages));
    window.dispatchEvent(new CustomEvent('sana_chat_updated'));
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !profile || !isApproved) return;

    const trimmed = content.trim();

    if (isMockMode) {
      const newMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        conversation_id: 'conv-001',
        sender_id: user.id,
        content: trimmed,
        reply_to_id: replyingTo?.id || null,
        reply_to: replyingTo
          ? {
              id: replyingTo.id,
              sender_name: replyingTo.sender?.display_name || 'Friend',
              content: replyingTo.content,
            }
          : null,
        is_edited: false,
        created_at: new Date().toISOString(),
        reactions: [],
        sender: profile,
      };

      saveMockMessages([...messages, newMsg]);
      setReplyingTo(null);
      setTimeout(() => scrollToBottom(true), 50);
      return;
    }

    try {
      const { error: sendError } = await supabase.from('messages').insert({
        conversation_id: '00000000-0000-0000-0000-000000000001',
        sender_id: user.id,
        content: trimmed,
        reply_to_id: replyingTo?.id || null,
      });

      if (sendError) throw sendError;

      setReplyingTo(null);
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    }
  };

  // Edit an existing message
  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim() || !user) return;

    if (isMockMode) {
      const updated = messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: newContent.trim(),
              is_edited: true,
              edited_at: new Date().toISOString(),
            }
          : m
      );
      saveMockMessages(updated);
      setEditingMessage(null);
      return;
    }

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
    } catch (err: any) {
      console.error('Failed to edit message:', err);
      setError(err.message || 'Failed to edit message');
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    if (isMockMode) {
      const updated = messages.filter((m) => m.id !== messageId);
      saveMockMessages(updated);
      return;
    }

    try {
      const { error: delError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (delError) throw delError;
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      setError(err.message || 'Failed to delete message');
    }
  };

  // Toggle emoji reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    if (isMockMode) {
      const updated = messages.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingIdx = msg.reactions.findIndex(
          (r) => r.user_id === user.id && r.emoji === emoji
        );

        let newReactions = [...msg.reactions];
        if (existingIdx >= 0) {
          // Remove reaction
          newReactions.splice(existingIdx, 1);
        } else {
          // Add reaction
          newReactions.push({
            id: `react-${Date.now()}-${Math.random()}`,
            message_id: messageId,
            user_id: user.id,
            emoji,
            created_at: new Date().toISOString(),
            user_name: profile?.display_name,
          });
        }
        return { ...msg, reactions: newReactions };
      });

      saveMockMessages(updated);
      return;
    }

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
