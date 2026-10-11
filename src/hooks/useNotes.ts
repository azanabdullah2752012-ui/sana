import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SharedNote, NoteCategory, NoteColor } from '../types/database';

export function useNotes() {
  const { user, isApproved } = useAuth();
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!isApproved) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('notes')
        .select(`
          *,
          creator:profiles!created_by(*),
          last_editor:profiles!last_edited_by(*)
        `)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setNotes(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [isApproved]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Realtime subscription
  useEffect(() => {
    if (!isApproved) return;

    const channel = supabase
      .channel('notes_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, fetchNotes]);

  const addNote = async (note: {
    title: string;
    content: string;
    category: NoteCategory;
    color_tag: NoteColor;
    is_pinned?: boolean;
  }) => {
    if (!user || !isApproved) return;

    const { data, error: insertErr } = await supabase
      .from('notes')
      .insert({
        created_by: user.id,
        last_edited_by: user.id,
        title: note.title.trim(),
        content: note.content.trim(),
        category: note.category,
        color_tag: note.color_tag,
        is_pinned: !!note.is_pinned,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    await fetchNotes();
    return data;
  };

  const updateNote = async (
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      category: NoteCategory;
      color_tag: NoteColor;
      is_pinned: boolean;
    }>
  ) => {
    if (!user || !isApproved) return;

    const { error: updateErr } = await supabase
      .from('notes')
      .update({
        ...updates,
        last_edited_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) throw updateErr;
    await fetchNotes();
  };

  const deleteNote = async (id: string) => {
    if (!user || !isApproved) return;

    const { error: delErr } = await supabase.from('notes').delete().eq('id', id);
    if (delErr) throw delErr;
    await fetchNotes();
  };

  const togglePin = async (id: string, currentPin: boolean) => {
    await updateNote(id, { is_pinned: !currentPin });
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    refreshNotes: fetchNotes,
  };
}
