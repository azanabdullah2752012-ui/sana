import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SharedNote, NoteCategory, NoteColor } from '../types/database';
import { INITIAL_MOCK_NOTES } from '../lib/mockData';

const MOCK_STORAGE_KEY = 'sana_mock_notes';

export function useNotes() {
  const { user, profile, isApproved, isMockMode } = useAuth();
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!isApproved) {
      setNotes([]);
      setLoading(false);
      return;
    }

    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        try {
          setNotes(JSON.parse(stored));
        } catch {
          setNotes(INITIAL_MOCK_NOTES);
        }
      } else {
        setNotes(INITIAL_MOCK_NOTES);
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_NOTES));
      }
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
  }, [isApproved, isMockMode]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Realtime
  useEffect(() => {
    if (!isApproved) return;

    if (isMockMode) {
      const handleStorage = () => {
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (stored) {
          try {
            setNotes(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      };
      window.addEventListener('sana_notes_updated', handleStorage as EventListener);
      return () => {
        window.removeEventListener('sana_notes_updated', handleStorage as EventListener);
      };
    }

    const channel = supabase
      .channel('notes_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isApproved, isMockMode, fetchNotes]);

  const saveMock = (newList: SharedNote[]) => {
    setNotes(newList);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent('sana_notes_updated'));
  };

  const addNote = async (note: {
    title: string;
    content: string;
    category: NoteCategory;
    color_tag: NoteColor;
    is_pinned?: boolean;
  }) => {
    if (!user || !profile || !isApproved) return;

    if (isMockMode) {
      const newNote: SharedNote = {
        id: `note-${Date.now()}`,
        created_by: user.id,
        last_edited_by: user.id,
        title: note.title.trim(),
        content: note.content.trim(),
        category: note.category,
        color_tag: note.color_tag,
        is_pinned: !!note.is_pinned,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: profile,
        last_editor: profile,
      };

      saveMock([newNote, ...notes]);
      return newNote;
    }

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
    fetchNotes();
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
    if (!user || !profile || !isApproved) return;

    if (isMockMode) {
      const updated = notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              last_edited_by: user.id,
              last_editor: profile,
              updated_at: new Date().toISOString(),
            }
          : n
      );
      saveMock(updated);
      return;
    }

    const { error: updateErr } = await supabase
      .from('notes')
      .update({
        ...updates,
        last_edited_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) throw updateErr;
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    if (!user || !isApproved) return;

    if (isMockMode) {
      saveMock(notes.filter((n) => n.id !== id));
      return;
    }

    const { error: delErr } = await supabase.from('notes').delete().eq('id', id);
    if (delErr) throw delErr;
    fetchNotes();
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
