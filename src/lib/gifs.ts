export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  category?: 'hugs' | 'cats' | 'coffee' | 'happy' | 'funny' | 'night' | 'cute';
  source?: 'klipy' | 'curated';
}

// Key access and storage
export function getKlipyApiKey(): string {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sana_klipy_api_key');
      if (stored && stored.trim()) return stored.trim();
    }
  } catch {}
  return (import.meta.env.VITE_KLIPY_API_KEY || '').trim();
}

export function setKlipyApiKey(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem('sana_klipy_api_key', key.trim());
      } else {
        localStorage.removeItem('sana_klipy_api_key');
      }
    }
  } catch {}
}

// Fallback high-speed curated cozy GIF vault
export const CURATED_GIFS: GifItem[] = [
  // Hugs & Love
  {
    id: 'gif-hug-1',
    title: 'Warm Hug',
    category: 'hugs',
    source: 'curated',
    url: 'https://media.tenor.com/1T1NmVU9e6IAAAAC/milk-and-mocha-hug.gif',
    previewUrl: 'https://media.tenor.com/1T1NmVU9e6IAAAAM/milk-and-mocha-hug.gif',
  },
  {
    id: 'gif-hug-2',
    title: 'Tight Squeeze',
    category: 'hugs',
    source: 'curated',
    url: 'https://media.tenor.com/wUQH5C2haFAAAAAC/hug-peach-cat.gif',
    previewUrl: 'https://media.tenor.com/wUQH5C2haFAAAAAM/hug-peach-cat.gif',
  },
  {
    id: 'gif-love-hearts',
    title: 'Sending Hearts',
    category: 'hugs',
    source: 'curated',
    url: 'https://media.tenor.com/y2N_d3zQ8z8AAAAC/love-you-hearts.gif',
    previewUrl: 'https://media.tenor.com/y2N_d3zQ8z8AAAAM/love-you-hearts.gif',
  },
  {
    id: 'gif-cuddle',
    title: 'Cozy Cuddle',
    category: 'hugs',
    source: 'curated',
    url: 'https://media.tenor.com/kCZvsNqTahQAAAAC/quby-cuddle.gif',
    previewUrl: 'https://media.tenor.com/kCZvsNqTahQAAAAM/quby-cuddle.gif',
  },

  // Cats & Cute
  {
    id: 'gif-cat-bop',
    title: 'Cute Bongo Cat',
    category: 'cats',
    source: 'curated',
    url: 'https://media.tenor.com/T_7H5W3Wk04AAAAC/bongo-cat.gif',
    previewUrl: 'https://media.tenor.com/T_7H5W3Wk04AAAAM/bongo-cat.gif',
  },
  {
    id: 'gif-cat-pat',
    title: 'Gentle Head Pats',
    category: 'cats',
    source: 'curated',
    url: 'https://media.tenor.com/E6fW2JyU_28AAAAC/cat-pat-head.gif',
    previewUrl: 'https://media.tenor.com/E6fW2JyU_28AAAAM/cat-pat-head.gif',
  },
  {
    id: 'gif-cat-peek',
    title: 'Curious Peeking Cat',
    category: 'cats',
    source: 'curated',
    url: 'https://media.tenor.com/83p1Xb7P3F4AAAAC/cat-peek.gif',
    previewUrl: 'https://media.tenor.com/83p1Xb7P3F4AAAAM/cat-peek.gif',
  },
  {
    id: 'gif-cat-cozy',
    title: 'Tucked In Cozy Cat',
    category: 'cats',
    source: 'curated',
    url: 'https://media.tenor.com/n6Y1aW_C2H8AAAAC/cat-sleepy-tucked-in.gif',
    previewUrl: 'https://media.tenor.com/n6Y1aW_C2H8AAAAM/cat-sleepy-tucked-in.gif',
  },

  // Coffee & Cozy
  {
    id: 'gif-coffee-pour',
    title: 'Morning Latte Art',
    category: 'coffee',
    source: 'curated',
    url: 'https://media.tenor.com/zV4X4C-0kCgAAAAC/coffee-pour.gif',
    previewUrl: 'https://media.tenor.com/zV4X4C-0kCgAAAAM/coffee-pour.gif',
  },
  {
    id: 'gif-rainy-coffee',
    title: 'Rainy Window Coffee',
    category: 'coffee',
    source: 'curated',
    url: 'https://media.tenor.com/WbZ65z5CjB8AAAAC/rain-coffee.gif',
    previewUrl: 'https://media.tenor.com/WbZ65z5CjB8AAAAM/rain-coffee.gif',
  },
  {
    id: 'gif-tea-cheers',
    title: 'Warm Tea Cheers',
    category: 'coffee',
    source: 'curated',
    url: 'https://media.tenor.com/xI6wXG5_t5wAAAAC/tea-cheers-warm.gif',
    previewUrl: 'https://media.tenor.com/xI6wXG5_t5wAAAAM/tea-cheers-warm.gif',
  },
  {
    id: 'gif-pastry-warm',
    title: 'Fresh Warm Croissant',
    category: 'coffee',
    source: 'curated',
    url: 'https://media.tenor.com/pZ6bWkE1EBAAAAAC/croissant-pastry.gif',
    previewUrl: 'https://media.tenor.com/pZ6bWkE1EBAAAAAM/croissant-pastry.gif',
  },

  // Happy & Celebrate
  {
    id: 'gif-happy-dance',
    title: 'Happy Dance',
    category: 'happy',
    source: 'curated',
    url: 'https://media.tenor.com/e2FqG-8F0_AAAAAC/happy-dance-cat.gif',
    previewUrl: 'https://media.tenor.com/e2FqG-8F0_AAAAAM/happy-dance-cat.gif',
  },
  {
    id: 'gif-confetti-yay',
    title: 'Yay Confetti!',
    category: 'happy',
    source: 'curated',
    url: 'https://media.tenor.com/0i3e0VfK_1cAAAAC/yay-confetti.gif',
    previewUrl: 'https://media.tenor.com/0i3e0VfK_1cAAAAM/yay-confetti.gif',
  },
  {
    id: 'gif-high-five',
    title: 'Team High Five',
    category: 'happy',
    source: 'curated',
    url: 'https://media.tenor.com/WwSsq7lB72UAAAAC/high-five.gif',
    previewUrl: 'https://media.tenor.com/WwSsq7lB72UAAAAM/high-five.gif',
  },

  // Funny & Laugh
  {
    id: 'gif-funny-shook',
    title: 'Dramatically Shocked',
    category: 'funny',
    source: 'curated',
    url: 'https://media.tenor.com/J8n4oN4N0hMAAAAC/surprised-cat.gif',
    previewUrl: 'https://media.tenor.com/J8n4oN4N0hMAAAAM/surprised-cat.gif',
  },
  {
    id: 'gif-funny-giggle',
    title: 'Cannot Stop Laughing',
    category: 'funny',
    source: 'curated',
    url: 'https://media.tenor.com/p1Q4yE_qF0UAAAAC/laughing-cute.gif',
    previewUrl: 'https://media.tenor.com/p1Q4yE_qF0UAAAAM/laughing-cute.gif',
  },
  {
    id: 'gif-funny-nod',
    title: 'Aggressive Nodding',
    category: 'funny',
    source: 'curated',
    url: 'https://media.tenor.com/cW_3-oE4E3kAAAAC/nod-yes.gif',
    previewUrl: 'https://media.tenor.com/cW_3-oE4E3kAAAAM/nod-yes.gif',
  },

  // Night & Sleep
  {
    id: 'gif-night-stars',
    title: 'Starry Goodnight',
    category: 'night',
    source: 'curated',
    url: 'https://media.tenor.com/Z4wR9bX12jMAAAAC/goodnight-stars.gif',
    previewUrl: 'https://media.tenor.com/Z4wR9bX12jMAAAAM/goodnight-stars.gif',
  },
  {
    id: 'gif-night-tuck',
    title: 'Sleepy Tucked Bedtime',
    category: 'night',
    source: 'curated',
    url: 'https://media.tenor.com/h5r8B8L0M8gAAAAC/sleepy-bedtime.gif',
    previewUrl: 'https://media.tenor.com/h5r8B8L0M8gAAAAM/sleepy-bedtime.gif',
  },
];

// Helper to extract clean media URLs from KLIPY API payload
function parseKlipyItem(item: any): GifItem | null {
  if (!item) return null;

  const id = String(item.id || item.slug || Math.random());
  const title = String(item.title || item.name || 'KLIPY GIF');

  // KLIPY media object structure: item.files (or item.file)
  const files = item.files || item.file || {};
  
  const originalUrl =
    files?.gif?.url ||
    files?.hd?.url ||
    files?.md?.url ||
    files?.sm?.url ||
    item.url ||
    item.media_url ||
    '';

  const previewUrl =
    files?.sm?.url ||
    files?.xs?.url ||
    files?.md?.url ||
    originalUrl;

  if (!originalUrl) return null;

  return {
    id: `klipy-${id}`,
    title,
    url: originalUrl,
    previewUrl: previewUrl || originalUrl,
    source: 'klipy',
  };
}

// Search GIFs with Klipy API, with automatic fallback
export async function searchGifs(query: string, limit = 24): Promise<GifItem[]> {
  const trimmed = query.trim();
  const apiKey = getKlipyApiKey();

  // 1. Try KLIPY API if key is present
  if (apiKey) {
    try {
      const endpoint = trimmed
        ? `https://api.klipy.com/api/v1/${apiKey}/gifs/search?q=${encodeURIComponent(trimmed)}&per_page=${limit}`
        : `https://api.klipy.com/api/v1/${apiKey}/gifs/trending?per_page=${limit}`;

      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json?.data?.data)
          ? json.data.data
          : Array.isArray(json?.data)
          ? json.data
          : [];

        const parsed = rawList.map(parseKlipyItem).filter(Boolean) as GifItem[];
        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('KLIPY API fetch issue, falling back to curated library:', err);
    }
  }

  // 2. Curated fallback library filtering
  if (!trimmed) {
    return CURATED_GIFS;
  }

  const q = trimmed.toLowerCase();
  const matches = CURATED_GIFS.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q))
  );

  return matches.length > 0 ? matches : CURATED_GIFS;
}

export function encodeGifMessage(url: string): string {
  return `[gif:${url.trim()}]`;
}

export function parseGifMessage(content: string): { isGif: boolean; url?: string } {
  const match = content.match(/^\[gif:(https?:\/\/[^\]]+)\]$/);
  if (match) {
    return { isGif: true, url: match[1] };
  }
  if (content.match(/^https?:\/\/\S+\.gif(\?\S*)?$/i)) {
    return { isGif: true, url: content.trim() };
  }
  return { isGif: false };
}
