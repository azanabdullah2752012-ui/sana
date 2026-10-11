import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SpecialDate, SpecialDateCategory } from '../types/database';
import { INITIAL_SPECIAL_DATES } from '../lib/mockData';

const MOCK_STORAGE_KEY = 'sana_mock_special_dates';

export function useSpecialDates() {
  const { user, isApproved, isMockMode } = useAuth();
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDates = useCallback(async () => {
    if (!isApproved) {
      setDates([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        try {
          setDates(JSON.parse(stored));
        } catch {
          setDates(INITIAL_SPECIAL_DATES);
        }
      } else {
        setDates(INITIAL_SPECIAL_DATES);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_SPECIAL_DATES));
      }
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
  }, [isApproved, isMockMode]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const saveMock = (newList: SpecialDate[]) => {
    setDates(newList);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('sana_dates_updated'));
  };

  const addDate = async (newDate: {
    title: string;
    event_date: string;
    description?: string;
    category: SpecialDateCategory;
    is_recurring_yearly?: boolean;
  }) => {
    if (!user || !isApproved) return;

    if (isMockMode) {
      const item: SpecialDate = {
        id: `date-${Date.now()}`,
        created_by: user.id,
        title: newDate.title.trim(),
        event_date: newDate.event_date,
        description: newDate.description?.trim() || null,
        category: newDate.category,
        is_recurring_yearly: newDate.is_recurring_yearly ?? true,
        created_at: new Date().toISOString(),
      };
      saveMock([...dates, item]);
      return item;
    }

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
    fetchDates();
    return data;
  };

  const deleteDate = async (id: string) => {
    if (!user || !isApproved) return;

    if (isMockMode) {
      saveMock(dates.filter((d) => d.id !== id));
      return;
    }

    const { error } = await supabase.from('special_dates').delete().eq('id', id);
    if (error) throw error;
    fetchDates();
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
