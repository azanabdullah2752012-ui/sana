import React, { useState, useMemo } from 'react';
import { Search, X, Smile, Heart, ThumbsUp, Coffee, Gift, Cat } from 'lucide-react';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  title?: string;
  isPopover?: boolean;
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
    name: 'Besties',
    icon: Heart,
    emojis: [
      '🌸', '💖', '✨', '☕', '🥰', '🫂', '💌', '🍰', '🌷', '🎀',
      '🧸', '🧋', '🍓', '🧁', '🌿', '🥞', '💐', '🤍', '🤎', '💕',
      '💞', '💓', '💗', '💫', '🌻', '🫖', '🥐', '🍯', '🍫', '🕯️',
    ],
  },
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      '😂', '🤣', '🥹', '😍', '😭', '😎', '🥳', '🫠', '😜', '🤭',
      '😏', '🥺', '🤩', '🙄', '😴', '😇', '😋', '🤫', '🥱', '🤓',
      '🤯', '😳', '🥳', '🤪', '🤡', '🤠', '😬', '😮‍💨', '🤤', '🥴',
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: ThumbsUp,
    emojis: [
      '👍', '✌️', '🫶', '🙌', '👏', '🤝', '👋', '🤞', '🫰', '🤙',
      '👊', '👌', '🙏', '💪', '💅', '🤏', '🫡', '🤛', '🤜', '🖐️',
      '✋', '👆', '👇', '👈', '👉', '🤟', '🤘', '🤌', '🫱', '🫲',
    ],
  },
  {
    id: 'animals',
    name: 'Cute & Nature',
    icon: Cat,
    emojis: [
      '🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🐥', '🦋', '🐝',
      '🐙', '🦦', '🦔', '🐾', '🦄', '🐧', '🦆', '🦉', '🌸', '🌼',
      '🌺', '🍀', '🍁', '🍂', '🍄', '🌙', '⭐', '🌈', '☁️', '❄️',
    ],
  },
  {
    id: 'food',
    name: 'Treats',
    icon: Coffee,
    emojis: [
      '☕', '🍵', '🧋', '🍰', '🧁', '🍦', '🍨', '🍩', '🍪', '🍫',
      '🥐', '🥞', '🧇', '🍕', '🍟', '🍔', '🍣', '🍜', '🍓', '🍒',
      '🍇', '🍉', '🥑', '🍿', '🥤', '🧃', '🥪', '🥟', '🥨', '🍡',
    ],
  },
  {
    id: 'vibes',
    name: 'Fun & Vibes',
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
  title = 'Insert Emoji',
  isPopover = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('besties');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEmojis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
      return cat ? cat.emojis : EMOJI_CATEGORIES[0].emojis;
    }
    const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    return Array.from(new Set(all));
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const content = (
    <div
      className="w-full sm:w-[360px] h-[340px] rounded-3xl bg-cream-50 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 shadow-2xl flex flex-col overflow-hidden animate-slide-up"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between shrink-0 bg-cream-100/60 dark:bg-cozydark-900/60">
        <div className="flex items-center gap-2">
          <span className="text-base">🌸</span>
          <h3 className="font-serif font-semibold text-xs sm:text-sm text-cream-900 dark:text-cream-50">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-cream-400 hover:text-cream-700 dark:hover:text-cream-200 hover:bg-cream-100 dark:hover:bg-cozydark-800 transition-colors"
          aria-label="Close emoji picker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pt-2.5 pb-1.5 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-cream-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-cream-100 dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1.5 focus:ring-blush-400/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1 px-3 py-1 border-b border-cream-200/60 dark:border-cozydark-750 overflow-x-auto no-scrollbar shrink-0">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? 'bg-blush-500 text-white font-medium shadow-xs'
                    : 'text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid: Smooth internal scroll, never gets cut off */}
      <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-7 gap-1">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            onClick={() => {
              onSelectEmoji(emoji);
              if (isPopover) {
                // Keep open or close smoothly
                onClose();
              } else {
                onClose();
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-xl rounded-xl hover:bg-cream-200/80 dark:hover:bg-cozydark-750 transition-all hover:scale-125 active:scale-95"
            title={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  if (isPopover) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in"
      onClick={onClose}
    >
      {content}
    </div>
  );
};
