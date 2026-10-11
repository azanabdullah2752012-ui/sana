export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  category: 'hugs' | 'cats' | 'coffee' | 'happy' | 'funny' | 'night';
}

export const CURATED_GIFS: GifItem[] = [
  // Hugs & Love
  {
    id: 'gif-hug-1',
    title: 'Warm Hug',
    category: 'hugs',
    url: 'https://media.giphy.com/media/l2QDM9Jnim1YV5bxC/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l2QDM9Jnim1YV5bxC/200w.gif',
  },
  {
    id: 'gif-hug-2',
    title: 'Tight Squeeze',
    category: 'hugs',
    url: 'https://media.giphy.com/media/u9BxQbM5bxvwY/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/u9BxQbM5bxvwY/200w.gif',
  },
  {
    id: 'gif-love-hearts',
    title: 'Sending Hearts',
    category: 'hugs',
    url: 'https://media.giphy.com/media/26BRv0ThflsDTqUXa/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/26BRv0ThflsDTqUXa/200w.gif',
  },
  {
    id: 'gif-cuddle',
    title: 'Soft Cuddle',
    category: 'hugs',
    url: 'https://media.giphy.com/media/gnXG2hODaCOru/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/gnXG2hODaCOru/200w.gif',
  },

  // Cats & Cute
  {
    id: 'gif-cat-bop',
    title: 'Bongo Cat Bop',
    category: 'cats',
    url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/200w.gif',
  },
  {
    id: 'gif-cat-pet',
    title: 'Gentle Head Pats',
    category: 'cats',
    url: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/13CoXDiaCcCoyk/200w.gif',
  },
  {
    id: 'gif-cat-peek',
    title: 'Curious Peeking Cat',
    category: 'cats',
    url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/200w.gif',
  },
  {
    id: 'gif-cat-cozy',
    title: 'Tucked In Cozy Cat',
    category: 'cats',
    url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/200w.gif',
  },

  // Coffee & Cozy
  {
    id: 'gif-coffee-pour',
    title: 'Steaming Morning Coffee',
    category: 'coffee',
    url: 'https://media.giphy.com/media/oZEBLugoTdzxK/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/oZEBLugoTdzxK/200w.gif',
  },
  {
    id: 'gif-rainy-coffee',
    title: 'Cozy Rain & Warm Drink',
    category: 'coffee',
    url: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/200w.gif',
  },
  {
    id: 'gif-tea-cheers',
    title: 'Tea Cheers',
    category: 'coffee',
    url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/200w.gif',
  },
  {
    id: 'gif-bakery',
    title: 'Warm Pastries',
    category: 'coffee',
    url: 'https://media.giphy.com/media/26uf7yJapo82e48yA/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/26uf7yJapo82e48yA/200w.gif',
  },

  // Happy & Dance
  {
    id: 'gif-happy-dance',
    title: 'Happy Little Dance',
    category: 'happy',
    url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/blSTtZehjAZ8I/200w.gif',
  },
  {
    id: 'gif-confetti-yay',
    title: 'Yay Confetti!',
    category: 'happy',
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/200w.gif',
  },
  {
    id: 'gif-high-five',
    title: 'Team High Five',
    category: 'happy',
    url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/200w.gif',
  },

  // Funny
  {
    id: 'gif-funny-shook',
    title: 'Dramatically Shocked',
    category: 'funny',
    url: 'https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/200w.gif',
  },
  {
    id: 'gif-funny-giggle',
    title: 'Cannot Stop Laughing',
    category: 'funny',
    url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/200w.gif',
  },
  {
    id: 'gif-funny-nod',
    title: 'Aggressive Nodding',
    category: 'funny',
    url: 'https://media.giphy.com/media/NEvPzZ8bdvhm8/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/NEvPzZ8bdvhm8/200w.gif',
  },

  // Night
  {
    id: 'gif-night-stars',
    title: 'Starry Goodnight',
    category: 'night',
    url: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/200w.gif',
  },
  {
    id: 'gif-night-tuck',
    title: 'Sleepy Blanket Bedtime',
    category: 'night',
    url: 'https://media.giphy.com/media/l0MYH8Q83CXvKPSC4/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/l0MYH8Q83CXvKPSC4/200w.gif',
  },
];

// Search Giphy or filter curated list
export async function searchGifs(query: string): Promise<GifItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return CURATED_GIFS;

  // First check curated items
  const localMatches = CURATED_GIFS.filter(
    (g) => g.title.toLowerCase().includes(trimmed) || g.category.includes(trimmed)
  );

  // Attempt live Giphy search with public key
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(
        trimmed
      )}&limit=16&rating=g`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const liveResults: GifItem[] = data.data.map((item: any) => ({
          id: `live-${item.id}`,
          title: item.title || trimmed,
          url: item.images?.downsized_medium?.url || item.images?.original?.url || item.url,
          previewUrl: item.images?.fixed_width_small?.url || item.images?.downsized?.url || item.url,
          category: 'happy',
        }));
        return liveResults;
      }
    }
  } catch (err) {
    // Graceful fallback to local matches
  }

  return localMatches.length > 0 ? localMatches : CURATED_GIFS;
}

export function encodeGifMessage(url: string): string {
  return `[gif:${url.trim()}]`;
}

export function parseGifMessage(content: string): { isGif: boolean; url?: string } {
  const match = content.match(/^\[gif:(https?:\/\/[^\]]+)\]$/);
  if (match) {
    return { isGif: true, url: match[1] };
  }
  // Check if content is a direct GIF link
  if (content.match(/^https?:\/\/\S+\.gif(\?\S*)?$/i)) {
    return { isGif: true, url: content.trim() };
  }
  return { isGif: false };
}
