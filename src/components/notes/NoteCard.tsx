import React from 'react';
import { SharedNote, NoteColor } from '../../types/database';
import { Pin, Edit, Trash2, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: SharedNote;
  onEdit: (note: SharedNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
}

const COLOR_STYLES: Record<NoteColor, { light: string; dark: string; border: string }> = {
  blush: {
    light: 'bg-[#FFF5F7] text-blush-950',
    dark: 'dark:bg-[#25151D] dark:text-blush-100',
    border: 'border-[#FED7E2] dark:border-[#52142A]',
  },
  lavender: {
    light: 'bg-[#FAF8FF] text-lavender-950',
    dark: 'dark:bg-[#1A1629] dark:text-lavender-100',
    border: 'border-[#E7DCFA] dark:border-[#381A6B]',
  },
  cream: {
    light: 'bg-[#FDFCF7] text-cream-950',
    dark: 'dark:bg-[#1E1B24] dark:text-cream-100',
    border: 'border-[#EADBCB] dark:border-[#3D2E23]',
  },
  mint: {
    light: 'bg-[#F0FDF4] text-emerald-950',
    dark: 'dark:bg-[#12241C] dark:text-emerald-100',
    border: 'border-[#BBF7D0] dark:border-[#14532D]',
  },
  peach: {
    light: 'bg-[#FFF7ED] text-amber-950',
    dark: 'dark:bg-[#241A14] dark:text-amber-100',
    border: 'border-[#FED7AA] dark:border-[#7C2D12]',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  reminder: 'Reminder 🧺',
  idea: 'Idea 💡',
  inside_joke: 'Inside Joke 🍋',
  later: 'Discuss Later 💬',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const styles = COLOR_STYLES[note.color_tag] || COLOR_STYLES.blush;

  const timeAgo = () => {
    try {
      return formatDistanceToNow(new Date(note.updated_at), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 border ${styles.light} ${styles.dark} ${styles.border} shadow-cozy hover:shadow-cozy-lg dark:shadow-cozy-dark dark:hover:shadow-cozy-dark-lg transition-all duration-300 flex flex-col justify-between group relative`}
    >
      <div>
        {/* Header: Category Badge & Pin Button */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-80">
            {CATEGORY_LABELS[note.category] || note.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(note.id, note.is_pinned)}
              className={`p-1.5 rounded-full transition-transform active:scale-125 ${
                note.is_pinned
                  ? 'text-blush-500 bg-blush-100/80 dark:bg-blush-950/80'
                  : 'text-cream-400 hover:text-blush-500 opacity-0 group-hover:opacity-100'
              }`}
              title={note.is_pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-blush-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-serif font-semibold text-base mb-2 leading-snug">
          {note.title}
        </h3>

        {/* Note Body */}
        <p className="text-xs whitespace-pre-wrap leading-relaxed opacity-90 font-light mb-4">
          {note.content}
        </p>
      </div>

      {/* Footer: Attribution & Edit/Delete */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] opacity-75">
        <div className="flex flex-col">
          <span>Created by {note.creator?.display_name || 'Friend'}</span>
          {note.last_editor && note.last_editor.id !== note.creator?.id && (
            <span className="text-[10px] opacity-80">
              Edited by {note.last_editor.display_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Edit note"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-rose-500 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
