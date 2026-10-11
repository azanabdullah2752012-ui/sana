import React, { useState, useMemo } from 'react';
import { Search, X, Smile, Heart, ThumbsUp, Coffee, Sparkles, Cat, Gift } from 'lucide-react';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  title?: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'besties',
    name: 'Besties & Warmth',
    icon: Heart,
    emojis: [
      '🌸', '💖', '✨', '☕', '🥰', '🫂', '💌', '🍰', '🌷', '🎀',
      '🧸', '🧋', '🍓', '🧁', '🌿', '🥞', '💐', '🤍', '🤎', '💕',
      '💞', '💓', '💗', '💫', '🌻', '🫖', '🥐', '🍯', '🍫', '🕯️',
    ],
  },
  {
    id: 'smileys',
    name: 'Smileys & Moods',
    icon: Smile,
    emojis: [
      '😂', '🤣', '🥹', '😍', '😭', '😎', '🥳', '🫠', '😜', '🤭',
      '😏', '🥺', '🤩', '🙄', '😴', '😇', '😋', '🤫', '🥱', '🤓',
      '🤯', '😳', '🥳', '🤪', '🤡', '🤠', '😬', '😮‍💨', '🤤', '🥴',
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures & Hands',
    icon: ThumbsUp,
    emojis: [
      '👍', '✌️', '🫶', '🙌', '👏', '🤝', '👋', '🤞', '🫰', '🤙',
      '👊', '👌', '🙏', '💪', '💅', '🤏', '🫡', '🤛', '🤜', '🖐️',
      '✋', '👆', '👇', '👈', '👉', '🤟', '🤘', '🤌', '🫱', '🫲',
    ],
  },
  {
    id: 'animals',
    name: 'Cute Animals & Nature',
    icon: Cat,
    emojis: [
      '🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🐥', '🦋', '🐝',
      '🐙', '🦦', '🦔', '🐾', '🦄', '🐧', '🦆', '🦉', '🌸', '🌼',
      '🌺', '🍀', '🍁', '🍂', '🍄', '🌙', '⭐', '🌈', '☁️', '❄️',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: Coffee,
    emojis: [
      '☕', '🍵', '🧋', '🍰', '🧁', '🍦', '🍨', '🍩', '🍪', '🍫',
      '🥐', '🥞', '🧇', '🍕', '🍟', '🍔', '🍣', '🍜', '🍓', '🍒',
      '🍇', '🍉', '🥑', '🍿', '🥤', '🧃', '🥪', '🥟', '🥨', '🍡',
    ],
  },
  {
    id: 'vibes',
    name: 'Celebrations & Vibes',
    icon: Gift,
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🔥', '🌟', '✨', '📸', '🎨', '🎵',
      '🎧', '🎮', '✈️', '🏖️', '🚀', '💡', '🏆', '🥇', '🔮', '🧸',
      '🪄', '💌', '📮', '📌', '📖', '🔑', '💎', '🍿', '🎬', '🧩',
    ],
  },
];

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  title = 'Choose an Emoji',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('besties');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmojis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
      return cat ? cat.emojis : EMOJI_CATEGORIES[0].emojis;
    }
    // Search across all categories
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    return Array.from(new Set(all));
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[560px] rounded-t-3xl sm:rounded-3xl bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h3 className="font-serif font-semibold text-sm sm:text-base text-cream-900 dark:text-cream-50">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-cream-400 hover:text-cream-700 dark:hover:text-cream-200 hover:bg-cream-100 dark:hover:bg-cozydark-800 transition-colors"
            aria-label="Close emoji picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 pt-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-cream-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search or browse emojis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-cream-100 dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-blush-400/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-cream-200/60 dark:border-cozydark-750 overflow-x-auto no-scrollbar">
            {EMOJI_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'bg-blush-500 text-white font-medium shadow-xs'
                      : 'text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-7 sm:grid-cols-8 gap-1.5 max-h-72 sm:max-h-80">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => {
                onSelectEmoji(emoji);
                onClose();
              }}
              className="w-10 h-10 flex items-center justify-center text-2xl rounded-2xl hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all hover:scale-125 active:scale-95"
              title={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Quick Tips Footer */}
        <div className="p-2.5 bg-cream-100/60 dark:bg-cozydark-900 border-t border-cream-200/80 dark:border-cozydark-750 text-[11px] text-cream-500 dark:text-cream-400 text-center">
          Tap any emoji to add to message or reaction ✨
        </div>
      </div>
    </div>
  );
};
