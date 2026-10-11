import React, { useState } from 'react';
import { Memory } from '../../types/database';
import { Heart, Calendar, MapPin, Tag, Edit, Trash2, Maximize2, X } from 'lucide-react';
import { format } from 'date-fns';

interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formattedDate = () => {
    try {
      const [year, month, day] = memory.memory_date.split('-');
      return format(new Date(Number(year), Number(month) - 1, Number(day)), 'MMMM d, yyyy');
    } catch {
      return memory.memory_date;
    }
  };

  return (
    <>
      <div className="group rounded-3xl bg-cream-50 dark:bg-cozydark-900 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy hover:shadow-cozy-lg dark:shadow-cozy-dark dark:hover:shadow-cozy-dark-lg transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
        
        {/* Memory Image with Polaroid vibe */}
        {memory.image_url && (
          <div className="relative overflow-hidden aspect-[4/3] bg-cream-200/50 dark:bg-cozydark-800">
            <img
              src={memory.image_url}
              alt={memory.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Dark gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <button
                onClick={() => setLightboxOpen(true)}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="View full image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Favorite Floating Button */}
            <button
              onClick={() => onToggleFavorite(memory.id, memory.is_favorite)}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform active:scale-125 ${
                memory.is_favorite
                  ? 'bg-blush-500 text-white shadow-soft-glow'
                  : 'bg-cream-100/80 dark:bg-cozydark-900/80 text-cream-600 dark:text-cream-300 hover:text-blush-500'
              }`}
              title={memory.is_favorite ? 'Favorited memory' : 'Mark as favorite'}
            >
              <Heart
                className={`w-4 h-4 ${memory.is_favorite ? 'fill-white' : ''}`}
              />
            </button>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Meta Row: Date & Location */}
            <div className="flex items-center justify-between text-[11px] text-cream-500 dark:text-cream-400 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blush-400" />
                <span>{formattedDate()}</span>
              </span>

              {memory.location && (
                <span className="flex items-center gap-1 text-blush-600 dark:text-blush-300 truncate max-w-[50%]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{memory.location}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg font-semibold text-cream-900 dark:text-cream-50 mb-2 leading-snug group-hover:text-blush-600 dark:group-hover:text-blush-300 transition-colors">
              {memory.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-cream-600 dark:text-cream-300 leading-relaxed line-clamp-3 mb-4 font-light">
              {memory.description}
            </p>

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 dark:bg-cozydark-800 text-cream-600 dark:text-cream-400 border border-cream-200/80 dark:border-cozydark-750"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Creator & Actions */}
          <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-cream-400 dark:text-cream-500 italic">
              Added by {memory.creator?.display_name || 'Friend'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(memory)}
                className="p-1.5 text-cream-400 hover:text-blush-600 dark:hover:text-blush-300 rounded-lg hover:bg-cream-100 dark:hover:bg-cozydark-800 transition-colors"
                title="Edit memory"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(memory.id)}
                className="p-1.5 text-cream-400 hover:text-rose-500 rounded-lg hover:bg-cream-100 dark:hover:bg-cozydark-800 transition-colors"
                title="Delete memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && memory.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={memory.image_url}
              alt={memory.title}
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-white/90 font-serif text-lg mt-3 text-center">
              {memory.title} • <span className="text-sm opacity-70">{formattedDate()}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};
