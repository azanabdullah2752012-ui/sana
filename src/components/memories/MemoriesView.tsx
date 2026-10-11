import React, { useState } from 'react';
import { useMemories } from '../../hooks/useMemories';
import { MemoryCard } from './MemoryCard';
import { MemoryModal } from './MemoryModal';
import { Memory } from '../../types/database';
import { Plus, Heart, Search, Camera, Sparkles } from 'lucide-react';

export const MemoriesView: React.FC = () => {
  const {
    memories,
    loading,
    addMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
  } = useMemories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  const handleOpenAdd = () => {
    setEditingMemory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setModalOpen(true);
  };

  const handleSaveMemory = async (data: any) => {
    if (editingMemory) {
      await updateMemory(editingMemory.id, data);
    } else {
      await addMemory(data);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (filterFavorites && !m.is_favorite) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.location?.toLowerCase().includes(query) ||
      m.tags?.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📸</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-cream-900 dark:text-cream-50">
              Shared Scrapbook
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-cream-600 dark:text-cream-400 font-light">
            Every laugh, cozy coffee, and unforgettable adventure kept safe in our private album.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-cream-50/80 dark:bg-cozydark-900/80 p-2.5 rounded-2xl border border-cream-200/80 dark:border-cozydark-800 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
          <input
            type="text"
            placeholder="Search memories, locations, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-cream-100/70 dark:bg-cozydark-850 border-none text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300"
          />
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 w-full sm:w-auto justify-center ${
            filterFavorites
              ? 'bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 border border-blush-300 dark:border-blush-700'
              : 'bg-cream-100/70 dark:bg-cozydark-850 text-cream-600 dark:text-cream-400 hover:text-cream-900'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-blush-500 text-blush-500' : ''}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Memory Grid */}
      {loading ? (
        <div className="py-20 text-center text-cream-400">
          <span className="w-6 h-6 border-2 border-blush-400 border-t-transparent rounded-full animate-spin inline-block mb-2" />
          <p className="text-xs font-serif">Unfolding our scrapbook...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-20 text-center bg-cream-50/50 dark:bg-cozydark-900/40 rounded-3xl border border-cream-200/80 dark:border-cozydark-800 p-8">
          <div className="w-14 h-14 rounded-3xl bg-blush-100 dark:bg-blush-950/60 flex items-center justify-center mx-auto mb-3 text-blush-500">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg text-cream-900 dark:text-cream-100 mb-1">
            No memories found
          </h3>
          <p className="text-xs text-cream-500 dark:text-cream-400 max-w-sm mx-auto mb-5">
            {searchQuery || filterFavorites
              ? 'Try adjusting your search query or removing the favorites filter.'
              : 'Your scrapbook is waiting for its first cozy picture or story.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 text-xs font-medium hover:bg-blush-200 transition-colors"
          >
            Add the First Memory 🌸
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={handleOpenEdit}
              onDelete={deleteMemory}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <MemoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        memoryToEdit={editingMemory}
        onSave={handleSaveMemory}
      />
    </div>
  );
};
