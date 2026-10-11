import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BucketListItem, BucketCategory } from '../types/database';
import { INITIAL_BUCKET_LIST } from '../lib/mockData';
import confetti from 'canvas-confetti';

const MOCK_STORAGE_KEY = 'sana_mock_bucket_list';

export function useBucketList() {
  const { user, profile, isApproved, isMockMode } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = useCallback(async () => {
    if (!isApproved) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch {
          setItems(INITIAL_BUCKET_LIST);
        }
      } else {
        setItems(INITIAL_BUCKET_LIST);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_BUCKET_LIST));
      }
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
  }, [isApproved, isMockMode]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const saveMock = (newList: BucketListItem[]) => {
    setItems(newList);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('sana_bucket_updated'));
  };

  const addItem = async (item: {
    title: string;
    notes?: string;
    category: BucketCategory;
    target_date?: string;
  }) => {
    if (!user || !profile || !isApproved) return;

    if (isMockMode) {
      const newItem: BucketListItem = {
        id: `bucket-${Date.now()}`,
        created_by: user.id,
        title: item.title.trim(),
        notes: item.notes?.trim() || null,
        category: item.category,
        is_completed: false,
        target_date: item.target_date || null,
        created_at: new Date().toISOString(),
        creator: profile,
      };

      saveMock([newItem, ...items]);
      return newItem;
    }

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
    fetchItems();
    return data;
  };

  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    if (!user || !isApproved) return;

    const willBeCompleted = !currentCompleted;

    if (willBeCompleted) {
      // Trigger joyful celebration confetti
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

    if (isMockMode) {
      const updated = items.map((i) =>
        i.id === id
          ? {
              ...i,
              is_completed: willBeCompleted,
              completed_at: willBeCompleted ? new Date().toISOString() : null,
              completed_by: willBeCompleted ? user.id : null,
            }
          : i
      );
      saveMock(updated);
      return;
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
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!user || !isApproved) return;

    if (isMockMode) {
      saveMock(items.filter((i) => i.id !== id));
      return;
    }

    const { error } = await supabase.from('bucket_list_items').delete().eq('id', id);
    if (error) throw error;
    fetchItems();
  };

  return {
    items,
    loading,
    addItem,
    toggleComplete,
    deleteItem,
  };
}
