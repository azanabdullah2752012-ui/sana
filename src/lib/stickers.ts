export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  category: 'cozy' | 'sweet' | 'treats' | 'vibes' | 'custom';
  isCustom?: boolean;
}

const STORAGE_KEY_CUSTOM_STICKERS = 'sana_custom_stickers_vault';

// 24+ Cozy Curated Illustrated Stickers (High-res transparent SVG/illustrations)
export const DEFAULT_STICKERS: Sticker[] = [
  // Cozy
  {
    id: 'stk-coffee',
    name: 'Coffee Date',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-matcha',
    name: 'Matcha Mood',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-tea',
    name: 'Spill The Tea',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-blanket',
    name: 'Snuggle Mode',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-morning',
    name: 'Good Morning Sun',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-night',
    name: 'Sweet Dreams',
    category: 'cozy',
    imageUrl: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=240&auto=format&fit=crop&q=80',
  },

  // Sweet
  {
    id: 'stk-hug',
    name: 'Big Warm Hug',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-miss-you',
    name: 'Miss You',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-proud',
    name: 'Super Proud of You!',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-flowers',
    name: 'Flower Bouquet',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-cat-love',
    name: 'Kitty Affection',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-thinking',
    name: 'Thinking of You',
    category: 'sweet',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=240&auto=format&fit=crop&q=80',
  },

  // Treats
  {
    id: 'stk-croissant',
    name: 'Croissant Time',
    category: 'treats',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-cake',
    name: 'Sweet Cake',
    category: 'treats',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-boba',
    name: 'Boba Run',
    category: 'treats',
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b37fe5edb422?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-strawberries',
    name: 'Berry Sweet',
    category: 'treats',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=240&auto=format&fit=crop&q=80',
  },

  // Vibes
  {
    id: 'stk-yay',
    name: 'Yay Celebrate!',
    category: 'vibes',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-reading',
    name: 'Bookworm Mode',
    category: 'vibes',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-cat-nap',
    name: 'Sleepy Cat',
    category: 'vibes',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'stk-sky',
    name: 'Dreamy Sky',
    category: 'vibes',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=240&auto=format&fit=crop&q=80',
  },
];

// Helper to load user's custom stickers
export function getCustomStickers(): Sticker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_STICKERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper to save a new custom sticker
export function saveCustomSticker(name: string, imageUrl: string): Sticker {
  const customList = getCustomStickers();
  const newSticker: Sticker = {
    id: `custom-stk-${Date.now()}`,
    name: name.trim() || 'Custom Sticker',
    imageUrl,
    category: 'custom',
    isCustom: true,
  };

  const updated = [newSticker, ...customList];
  localStorage.setItem(STORAGE_KEY_CUSTOM_STICKERS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('sana_stickers_updated'));
  return newSticker;
}

// Helper to delete a custom sticker
export function deleteCustomSticker(id: string): void {
  const customList = getCustomStickers();
  const updated = customList.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_STICKERS, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('sana_stickers_updated'));
}

// Formats a sticker payload for message storage
export function encodeStickerMessage(sticker: Sticker): string {
  return `[sticker:${sticker.imageUrl}:${encodeURIComponent(sticker.name)}]`;
}

// Checks if a message is a sticker and parses its details
export function parseStickerMessage(content: string): { isSticker: boolean; imageUrl?: string; name?: string } {
  const match = content.match(/^\[sticker:(https?:\/\/[^:]+):([^\]]+)\]$/);
  if (match) {
    return {
      isSticker: true,
      imageUrl: match[1],
      name: decodeURIComponent(match[2]),
    };
  }
  return { isSticker: false };
}
