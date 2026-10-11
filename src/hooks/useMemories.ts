import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Memory } from '../types/database';

export function useMemories() {
  const { user, isApproved } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    if (!isApproved) {
      setMemories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('memories')
        .select(`
          *,
          creator:profiles!created_by(*)
        `)
        .order('memory_date', { ascending: false });

      if (fetchErr) throw fetchErr;
      setMemories(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching memories:', err);
      setError(err.message || 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, [isApproved]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('memories_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories' },
        () => fetchMemories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchMemories]);

  const addMemory = async (memory: {
    title: string;
    description: string;
    memory_date: string;
    image_url?: string | null;
    location?: string | null;
    tags?: string[];
  }) => {
    if (!user || !isApproved) return;

    const { data, error: insertErr } = await supabase
      .from('memories')
      .insert({
        created_by: user.id,
        title: memory.title.trim(),
        description: memory.description.trim(),
        memory_date: memory.memory_date,
        image_url: memory.image_url || null,
        location: memory.location?.trim() || null,
        tags: memory.tags || [],
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    await fetchMemories();
    return data;
  };

  const updateMemory = async (
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      memory_date: string;
      image_url?: string | null;
      location?: string | null;
      tags?: string[];
      is_favorite?: boolean;
    }>
  ) => {
    if (!user || !isApproved) return;

    const { error: updateErr } = await supabase
      .from('memories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) throw updateErr;
    await fetchMemories();
  };

  const deleteMemory = async (id: string) => {
    if (!user || !isApproved) return;

    const { error: delErr } = await supabase.from('memories').delete().eq('id', id);
    if (delErr) throw delErr;
    await fetchMemories();
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await updateMemory(id, { is_favorite: !current });
  };

  return {
    memories,
    loading,
    error,
    addMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
    refreshMemories: fetchMemories,
  };
}
