import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Memory } from '../types/database';
import { INITIAL_MOCK_MEMORIES } from '../lib/mockData';

const MOCK_STORAGE_KEY = 'sana_mock_memories';

export function useMemories() {
  const { user, profile, isApproved, isMockMode } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    if (!isApproved) {
      setMemories([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        try {
          setMemories(JSON.parse(stored));
        } catch {
          setMemories(INITIAL_MOCK_MEMORIES);
        }
      } else {
        setMemories(INITIAL_MOCK_MEMORIES);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MEMORIES));
      }
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
  }, [isApproved, isMockMode]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    if (isMockMode) {
      const handleStorage = () => {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) {
          try {
            setMemories(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      };
      window.addEventListener('sana_memories_updated', handleStorage as EventListener);
      return () => {
        window.removeEventListener('sana_memories_updated', handleStorage as EventListener);
      };
    }

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
  }, [isApproved, isMockMode, fetchMemories]);

  const saveMock = (newList: Memory[]) => {
    setMemories(newList);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('sana_memories_updated'));
  };

  const addMemory = async (memory: {
    title: string;
    description: string;
    memory_date: string;
    image_url?: string | null;
    location?: string | null;
    tags?: string[];
  }) => {
    if (!user || !profile || !isApproved) return;

    if (isMockMode) {
      const newMem: Memory = {
        id: `mem-${Date.now()}`,
        created_by: user.id,
        title: memory.title.trim(),
        description: memory.description.trim(),
        memory_date: memory.memory_date,
        image_url: memory.image_url || null,
        location: memory.location?.trim() || null,
        tags: memory.tags || [],
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: profile,
      };

      saveMock([newMem, ...memories]);
      return newMem;
    }

    const { data, error: insertErr } = await supabase
      .from('memories')
      .insert({
        created_by: user.id,
        title: memory.title.trim(),
        description: memory.description.trim(),
        memory_date: memory.memory_date,
        image_url: memory.image_url,
        location: memory.location?.trim() || null,
        tags: memory.tags || [],
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    fetchMemories();
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

    if (isMockMode) {
      const updated = memories.map((m) =>
        m.id === id
          ? { ...m, ...updates, updated_at: new Date().toISOString() }
          : m
      );
      saveMock(updated);
      return;
    }

    const { error: updateErr } = await supabase
      .from('memories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) throw updateErr;
    fetchMemories();
  };

  const deleteMemory = async (id: string) => {
    if (!user || !isApproved) return;

    if (isMockMode) {
      saveMock(memories.filter((m) => m.id !== id));
      return;
    }

    const { error: delErr } = await supabase.from('memories').delete().eq('id', id);
    if (delErr) throw delErr;
    fetchMemories();
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
