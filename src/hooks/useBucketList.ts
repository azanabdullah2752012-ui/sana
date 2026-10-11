import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BucketListItem, BucketCategory } from '../types/database';
import confetti from 'canvas-confetti';

export function useBucketList() {
  const { user, profile, isApproved } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = useCallback(async () => {
    if (!isApproved) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bucket_list_items')
        .select(`
          *,
          creator:profiles!created_by(*)
        `)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching bucket list items:', err);
    } finally {
      setLoading(false);
    }
  }, [isApproved]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('bucket_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bucket_list_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchItems]);

  const addItem = async (item: {
    title: string;
    notes?: string;
    category: BucketCategory;
    target_date?: string;
  }) => {
    if (!user || !profile || !isApproved) return;

    const { data, error } = await supabase
      .from('bucket_list_items')
      .insert({
        created_by: user.id,
        title: item.title.trim(),
        notes: item.notes?.trim() || null,
        category: item.category,
        target_date: item.target_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchItems();
    return data;
  };

  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    if (!user || !isApproved) return;

    const willBeCompleted = !currentCompleted;

    if (willBeCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F68CAE', '#BA9BF0', '#EADBCB', '#FBB7CD'],
        });
      } catch (e) {
        // Safe fallback
      }
    }

    const { error } = await supabase
      .from('bucket_list_items')
      .update({
        is_completed: willBeCompleted,
        completed_at: willBeCompleted ? new Date().toISOString() : null,
        completed_by: willBeCompleted ? user.id : null,
      })
      .eq('id', id);

    if (error) throw error;
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!user || !isApproved) return;

    const { error } = await supabase.from('bucket_list_items').delete().eq('id', id);
    if (error) throw error;
    await fetchItems();
  };

  return {
    items,
    loading,
    addItem,
    toggleComplete,
    deleteItem,
  };
}
