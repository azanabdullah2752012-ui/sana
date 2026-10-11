import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SharedNote, NoteCategory, NoteColor } from '../../types/database';
import { useToast } from '../common/Toast';
import { BookOpen, Pin } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: SharedNote | null;
  onSave: (noteData: {
    title: string;
    content: string;
    category: NoteCategory;
    color_tag: NoteColor;
    is_pinned?: boolean;
  }) => Promise<any>;
}

const CATEGORIES: { id: NoteCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'reminder', label: 'Reminders & Checklists' },
  { id: 'idea', label: 'Ideas & Plans' },
  { id: 'inside_joke', label: 'Inside Jokes 🍋' },
  { id: 'later', label: 'To Discuss Later' },
];

const COLORS: { id: NoteColor; label: string; class: string }[] = [
  { id: 'blush', label: 'Blush', class: 'bg-[#FED7E2] dark:bg-[#7B2141]' },
  { id: 'lavender', label: 'Lavender', class: 'bg-[#E7DCFA] dark:bg-[#502891]' },
  { id: 'cream', label: 'Cream', class: 'bg-[#FAF6ED] dark:bg-[#3D2E23]' },
  { id: 'mint', label: 'Mint', class: 'bg-[#D1FAE5] dark:bg-[#064E3B]' },
  { id: 'peach', label: 'Peach', class: 'bg-[#FFEDD5] dark:bg-[#7C2D12]' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  noteToEdit,
  onSave,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [colorTag, setColorTag] = useState<NoteColor>('blush');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setCategory(noteToEdit.category);
      setColorTag(noteToEdit.color_tag);
      setIsPinned(noteToEdit.is_pinned);
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setColorTag('blush');
      setIsPinned(false);
    }
  }, [noteToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill out both title and note content', 'error');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        category,
        color_tag: colorTag,
        is_pinned: isPinned,
      });

      showToast(noteToEdit ? 'Note updated ✨' : 'Note added to our notebook! 📝', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blush-400" />
          <span>{noteToEdit ? 'Edit Note' : 'Create a Shared Note'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Inside jokes from yesterday / Coffee order"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Note Content
          </label>
          <textarea
            rows={5}
            required
            placeholder="Write reminders, inside thoughts, quotes, or lists..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300 font-sans"
          />
        </div>

        {/* Category & Pin Option */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="w-full px-3 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-blush-300"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Pin to Top
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 cursor-pointer text-xs text-cream-800 dark:text-cream-200">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded text-blush-500 focus:ring-blush-400"
              />
              <Pin className="w-3.5 h-3.5 text-blush-500" />
              <span>Keep pinned at top</span>
            </label>
          </div>
        </div>

        {/* Color Palette Tag */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Card Accent Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setColorTag(col.id)}
                className={`w-7 h-7 rounded-full ${col.class} border-2 transition-transform ${
                  colorTag === col.id
                    ? 'border-cream-900 dark:border-white scale-110 shadow-sm'
                    : 'border-transparent hover:scale-105'
                }`}
                title={col.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-cream-200/80 dark:border-cozydark-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : noteToEdit ? 'Save Changes' : 'Pin Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
