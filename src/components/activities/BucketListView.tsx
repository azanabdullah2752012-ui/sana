import React, { useState } from 'react';
import { useBucketList } from '../../hooks/useBucketList';
import { BucketCategory } from '../../types/database';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '../common/Toast';

const CATEGORIES: { id: BucketCategory; label: string }[] = [
  { id: 'adventure', label: 'Adventure 🌲' },
  { id: 'food', label: 'Food & Cafes 🥐' },
  { id: 'travel', label: 'Travel ✈️' },
  { id: 'creative', label: 'Creative 🎨' },
  { id: 'cozy', label: 'Cozy & Home ☕' },
  { id: 'relax', label: 'Relax & Chill 🧘' },
];

export const BucketListView: React.FC = () => {
  const { items, loading, addItem, toggleComplete, deleteItem } = useBucketList();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newCategory, setNewCategory] = useState<BucketCategory>('adventure');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addItem({
      title: newTitle.trim(),
      notes: newNotes.trim() || undefined,
      category: newCategory,
      target_date: newTargetDate || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setNewTargetDate('');
    setIsAdding(false);
    showToast('Adventure added to our bucket list! 🌟', 'success');
  };

  const completedCount = items.filter((i) => i.is_completed).length;

  const filteredItems = items.filter((i) => {
    if (filterCategory === 'all') return true;
    return i.category === filterCategory;
  });

  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-800 shadow-cozy dark:shadow-cozy-dark">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50">
              Things to Do Together
            </h3>
          </div>
          <p className="text-xs text-cream-500 dark:text-cream-400 font-light">
            Our shared wishlist of cozy trips, food experiments, and adventures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-blush-100 dark:bg-blush-950/60 text-blush-700 dark:text-blush-300 font-medium">
            {completedCount} of {items.length} Completed
          </span>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white shadow-sm transition-transform active:scale-95"
            title="Add item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-4 mb-5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 space-y-3 animate-slide-up"
        >
          <input
            type="text"
            required
            placeholder="What should we do together? e.g. Ceramic pottery workshop"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300"
          />

          <input
            type="text"
            placeholder="Little details or notes (optional)..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300"
          />

          <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as BucketCategory)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-cream-500 hover:bg-cream-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium shadow-sm transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            filterCategory === 'all'
              ? 'bg-blush-500 text-white'
              : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterCategory === c.id
                ? 'bg-blush-500 text-white'
                : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-8 text-center text-xs text-cream-400">Loading list...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-cream-400">
            No items in this category yet. Add one!
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                item.is_completed
                  ? 'bg-cream-100/50 dark:bg-cozydark-850/40 border-cream-200/50 dark:border-cozydark-800 opacity-70'
                  : 'bg-white dark:bg-cozydark-850 border-cream-200/80 dark:border-cozydark-800 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleComplete(item.id, item.is_completed)}
                  className="mt-0.5 text-blush-500 hover:scale-110 transition-transform shrink-0"
                  title={item.is_completed ? 'Mark uncompleted' : 'Mark completed! 🎉'}
                >
                  {item.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 fill-blush-100 dark:fill-blush-950 text-blush-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-cream-300 hover:text-blush-400" />
                  )}
                </button>

                <div className="flex-1">
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      item.is_completed
                        ? 'line-through text-cream-500 dark:text-cream-400'
                        : 'text-cream-900 dark:text-cream-50'
                    }`}
                  >
                    {item.title}
                  </p>

                  {item.notes && (
                    <p className="text-[11px] text-cream-500 dark:text-cream-400 mt-0.5 font-light">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-cream-400">
                    <span className="capitalize">#{item.category}</span>
                    {item.target_date && <span>• Target: {item.target_date}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-cream-300 hover:text-rose-500 p-1 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
