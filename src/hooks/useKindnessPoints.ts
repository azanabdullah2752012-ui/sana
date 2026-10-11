import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { KindnessPointEntry, KindnessCategory } from '../types/database';
import { BASE_USER_AZAN, BASE_USER_SANA } from '../lib/mockData';

const STORAGE_KEY = 'sana_kindness_points';
const EVENT_NAME = 'sana_kindness_updated';

// Warm, cute initial deeds if fresh installation
const INITIAL_DEEDS: KindnessPointEntry[] = [
  {
    id: 'pt-init-1',
    recipient_id: BASE_USER_SANA.id,
    giver_id: BASE_USER_AZAN.id,
    points: 1,
    reason: 'Built this whole private sanctuary for us 🌸✨',
    category: 'thoughtful',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pt-init-2',
    recipient_id: BASE_USER_AZAN.id,
    giver_id: BASE_USER_SANA.id,
    points: 1,
    reason: 'Sent the funniest reels & laughed uncontrollably 😂',
    category: 'laughter',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pt-init-3',
    recipient_id: BASE_USER_SANA.id,
    giver_id: BASE_USER_AZAN.id,
    points: 1,
    reason: 'Listened and cheered me up when tired 🫂',
    category: 'support',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pt-init-4',
    recipient_id: BASE_USER_AZAN.id,
    giver_id: BASE_USER_SANA.id,
    points: 1,
    reason: 'Surprise treat & coffee reminder ☕',
    category: 'treat',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

function getStoredEntries(): KindnessPointEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading kindness points from storage:', e);
  }
  return INITIAL_DEEDS;
}

function saveStoredEntries(entries: KindnessPointEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: entries }));
  } catch (e) {
    console.warn('Error saving kindness points to storage:', e);
  }
}

export function useKindnessPoints() {
  const [entries, setEntries] = useState<KindnessPointEntry[]>(getStoredEntries);
  const [loading, setLoading] = useState(false);

  // Sync with Supabase on mount
  useEffect(() => {
    let channel: any = null;

    const fetchSupabaseEntries = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('kindness_points')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setEntries(data as KindnessPointEntry[]);
          saveStoredEntries(data as KindnessPointEntry[]);
        }
      } catch (err) {
        // Table may not exist yet, fallback to localStorage cleanly
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseEntries();

    // Listen for local updates across tabs
    const handleLocalUpdate = (e: any) => {
      if (e.detail) {
        setEntries(e.detail);
      } else {
        setEntries(getStoredEntries());
      }
    };

    window.addEventListener(EVENT_NAME, handleLocalUpdate);

    // Setup Supabase Realtime subscription
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel('public:kindness_points')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'kindness_points' },
            () => {
              fetchSupabaseEntries();
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime kindness subscription warning:', e);
      }
    }

    return () => {
      window.removeEventListener(EVENT_NAME, handleLocalUpdate);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Compute points
  const azanPoints = useMemo(() => {
    return entries
      .filter((e) => e.recipient_id === BASE_USER_AZAN.id)
      .reduce((sum, e) => sum + (Number(e.points) || 1), 0);
  }, [entries]);

  const sanaPoints = useMemo(() => {
    return entries
      .filter((e) => e.recipient_id === BASE_USER_SANA.id)
      .reduce((sum, e) => sum + (Number(e.points) || 1), 0);
  }, [entries]);

  const awardPoints = useCallback(
    async (
      recipientId: string,
      giverId: string,
      points: number,
      reason: string,
      category: KindnessCategory
    ) => {
      const newEntry: KindnessPointEntry = {
        id: `pt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        recipient_id: recipientId,
        giver_id: giverId,
        points: Math.max(1, points),
        reason: reason.trim(),
        category,
        created_at: new Date().toISOString(),
      };

      const updated = [newEntry, ...entries];
      setEntries(updated);
      saveStoredEntries(updated);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('kindness_points').insert([newEntry]);
        } catch (e) {
          console.warn('Supabase kindness point sync warning:', e);
        }
      }
      return newEntry;
    },
    [entries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveStoredEntries(updated);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('kindness_points').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete kindness warning:', e);
        }
      }
    },
    [entries]
  );

  return {
    entries,
    loading,
    azanPoints,
    sanaPoints,
    totalKindnesses: entries.length,
    awardPoints,
    deleteEntry,
  };
}
