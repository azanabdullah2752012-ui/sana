import React, { useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { SharedNote, NoteCategory } from '../../types/database';
import { Plus, Search, BookOpen, Pin } from 'lucide-react';

export const NotesView: React.FC = () => {
  const { notes, loading, addNote, updateNote, deleteNote, togglePin } = useNotes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SharedNote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenAdd = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (note: SharedNote) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleSaveNote = async (data: any) => {
    if (editingNote) {
      await updateNote(editingNote.id, data);
    } else {
      await addNote(data);
    }
  };

  const categories = [
    { id: 'all', label: 'All Notes' },
    { id: 'pinned', label: 'Pinned Only 📌' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'inside_joke', label: 'Inside Jokes 🍋' },
    { id: 'idea', label: 'Ideas' },
    { id: 'later', label: 'To Discuss Later' },
  ];

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory === 'pinned' && !n.is_pinned) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'pinned' && n.category !== selectedCategory)
      return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📓</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-cream-900 dark:text-cream-50">
              Shared Notebook
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-cream-600 dark:text-cream-400 font-light">
            Inside jokes, packing lists, shared ideas, and questions to talk about over coffee.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="space-y-3">
        <div className="flex items-center overflow-x-auto pb-1 gap-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blush-500 text-white shadow-sm'
                  : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-800 border border-cream-200 dark:border-cozydark-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
          <input
            type="text"
            placeholder="Search within notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50/80 dark:bg-cozydark-900/80 border border-cream-200/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-cream-400">
          <span className="w-6 h-6 border-2 border-blush-400 border-t-transparent rounded-full animate-spin inline-block mb-2" />
          <p className="text-xs font-serif">Opening our shared pages...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-20 text-center bg-cream-50/50 dark:bg-cozydark-900/40 rounded-3xl border border-cream-200/80 dark:border-cozydark-800 p-8">
          <div className="w-14 h-14 rounded-3xl bg-blush-100 dark:bg-blush-950/60 flex items-center justify-center mx-auto mb-3 text-blush-500">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg text-cream-900 dark:text-cream-100 mb-1">
            No notes here yet
          </h3>
          <p className="text-xs text-cream-500 dark:text-cream-400 max-w-sm mx-auto mb-5">
            {searchQuery
              ? 'No matching notes for your search query.'
              : 'Jot down an inside joke, a book recommendation, or a grocery list!'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 text-xs font-medium hover:bg-blush-200 transition-colors"
          >
            Create the First Note ✍️
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleOpenEdit}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        noteToEdit={editingNote}
        onSave={handleSaveNote}
      />
    </div>
  );
};
