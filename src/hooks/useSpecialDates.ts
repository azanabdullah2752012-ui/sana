import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SpecialDate, SpecialDateCategory } from '../types/database';

export function useSpecialDates() {
  const { user, isApproved } = useAuth();
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDates = useCallback(async () => {
    if (!isApproved) {
      setDates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('special_dates')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setDates(data || []);
    } catch (err) {
      console.error('Error fetching special dates:', err);
    } finally {
      setLoading(false);
    }
  }, [isApproved]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('dates_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'special_dates' }, () => {
        fetchDates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchDates]);

  const addDate = async (newDate: {
    title: string;
    event_date: string;
    description?: string;
    category: SpecialDateCategory;
    is_recurring_yearly?: boolean;
  }) => {
    if (!user || !isApproved) return;

    const { data, error } = await supabase
      .from('special_dates')
      .insert({
        created_by: user.id,
        title: newDate.title.trim(),
        event_date: newDate.event_date,
        description: newDate.description?.trim() || null,
        category: newDate.category,
        is_recurring_yearly: newDate.is_recurring_yearly ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchDates();
    return data;
  };

  const deleteDate = async (id: string) => {
    if (!user || !isApproved) return;

    const { error } = await supabase.from('special_dates').delete().eq('id', id);
    if (error) throw error;
    await fetchDates();
  };

  // Helper to calculate days remaining until next occurrence
  const getDaysUntil = (dateStr: string, isRecurring = false): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    if (isRecurring) {
      target.setFullYear(today.getFullYear());
      if (target.getTime() < today.getTime()) {
        target.setFullYear(today.getFullYear() + 1);
      }
    }

    const diffMs = target.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return {
    dates,
    loading,
    addDate,
    deleteDate,
    getDaysUntil,
  };
}
