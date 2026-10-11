export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  category: 'hugs' | 'cats' | 'coffee' | 'happy' | 'funny' | 'night';
  keywords: string[];
}

export const CURATED_GIFS: GifItem[] = [
  // Hugs & Love
  {
    id: 'gif-hug-1',
    title: 'Warm Hug',
    category: 'hugs',
    keywords: ['hug', 'love', 'warm', 'squeeze', 'hold', 'miss', 'cozy', 'friend'],
    url: 'https://i.giphy.com/u9BxQbM5bxvwY.gif',
    previewUrl: 'https://i.giphy.com/u9BxQbM5bxvwY.gif',
  },
  {
    id: 'gif-hug-2',
    title: 'Gentle Embrace',
    category: 'hugs',
    keywords: ['hug', 'embrace', 'comfort', 'love', 'care', 'friends'],
    url: 'https://i.giphy.com/l2QDM9Jnim1YV5bxC.gif',
    previewUrl: 'https://i.giphy.com/l2QDM9Jnim1YV5bxC.gif',
  },
  {
    id: 'gif-love-hearts',
    title: 'Sending Hearts',
    category: 'hugs',
    keywords: ['heart', 'love', 'hearts', 'affection', 'sweet', 'cute'],
    url: 'https://i.giphy.com/26BRv0ThflsDTqUXa.gif',
    previewUrl: 'https://i.giphy.com/26BRv0ThflsDTqUXa.gif',
  },
  {
    id: 'gif-cuddle',
    title: 'Soft Cuddle',
    category: 'hugs',
    keywords: ['cuddle', 'snuggle', 'hug', 'warm', 'sleepy'],
    url: 'https://i.giphy.com/gnXG2hODaCOru.gif',
    previewUrl: 'https://i.giphy.com/gnXG2hODaCOru.gif',
  },

  // Cats & Cute
  {
    id: 'gif-cat-bop',
    title: 'Cute Bongo Cat',
    category: 'cats',
    keywords: ['cat', 'kitty', 'cute', 'music', 'bongo', 'bop', 'pet'],
    url: 'https://i.giphy.com/jpbnoe3UIa8TU8LM13.gif',
    previewUrl: 'https://i.giphy.com/jpbnoe3UIa8TU8LM13.gif',
  },
  {
    id: 'gif-cat-pet',
    title: 'Gentle Head Pats',
    category: 'cats',
    keywords: ['cat', 'pat', 'pats', 'headpat', 'kitty', 'pet', 'cute', 'purr'],
    url: 'https://i.giphy.com/13CoXDiaCcCoyk.gif',
    previewUrl: 'https://i.giphy.com/13CoXDiaCcCoyk.gif',
  },
  {
    id: 'gif-cat-peek',
    title: 'Curious Peeking Cat',
    category: 'cats',
    keywords: ['cat', 'peek', 'look', 'hello', 'hi', 'peekaboo', 'kitty'],
    url: 'https://i.giphy.com/JIX9t2j0ZTN9S.gif',
    previewUrl: 'https://i.giphy.com/JIX9t2j0ZTN9S.gif',
  },
  {
    id: 'gif-cat-cozy',
    title: 'Tucked In Cozy Cat',
    category: 'cats',
    keywords: ['cat', 'blanket', 'cozy', 'bed', 'sleepy', 'kitty', 'rest'],
    url: 'https://i.giphy.com/MDJ9IbxxvDUQM.gif',
    previewUrl: 'https://i.giphy.com/MDJ9IbxxvDUQM.gif',
  },

  // Coffee & Cozy
  {
    id: 'gif-coffee-pour',
    title: 'Steaming Morning Coffee',
    category: 'coffee',
    keywords: ['coffee', 'latte', 'espresso', 'morning', 'cup', 'steam', 'warm', 'cafe'],
    url: 'https://i.giphy.com/oZEBLugoTdzxK.gif',
    previewUrl: 'https://i.giphy.com/oZEBLugoTdzxK.gif',
  },
  {
    id: 'gif-rainy-coffee',
    title: 'Cozy Rain & Warm Drink',
    category: 'coffee',
    keywords: ['rain', 'coffee', 'tea', 'rainy', 'window', 'cozy', 'fall', 'peace'],
    url: 'https://i.giphy.com/3o7qDEq2bMbcbPRQ2c.gif',
    previewUrl: 'https://i.giphy.com/3o7qDEq2bMbcbPRQ2c.gif',
  },
  {
    id: 'gif-tea-cheers',
    title: 'Tea Cheers',
    category: 'coffee',
    keywords: ['tea', 'matcha', 'cheers', 'drink', 'toast', 'cozy', 'warm'],
    url: 'https://i.giphy.com/l41lI4bYmcsPJX9Go.gif',
    previewUrl: 'https://i.giphy.com/l41lI4bYmcsPJX9Go.gif',
  },
  {
    id: 'gif-bakery',
    title: 'Warm Pastries',
    category: 'coffee',
    keywords: ['pastry', 'bakery', 'croissant', 'bake', 'cake', 'food', 'treat', 'snack'],
    url: 'https://i.giphy.com/26uf7yJapo82e48yA.gif',
    previewUrl: 'https://i.giphy.com/26uf7yJapo82e48yA.gif',
  },

  // Happy & Dance
  {
    id: 'gif-happy-dance',
    title: 'Happy Little Dance',
    category: 'happy',
    keywords: ['happy', 'dance', 'excited', 'joy', 'groove', 'vibe', 'yay'],
    url: 'https://i.giphy.com/blSTtZehjAZ8I.gif',
    previewUrl: 'https://i.giphy.com/blSTtZehjAZ8I.gif',
  },
  {
    id: 'gif-confetti-yay',
    title: 'Yay Confetti!',
    category: 'happy',
    keywords: ['yay', 'confetti', 'celebrate', 'cheer', 'party', 'proud', 'woohoo'],
    url: 'https://i.giphy.com/artj92V8o75VPL7AeQ.gif',
    previewUrl: 'https://i.giphy.com/artj92V8o75VPL7AeQ.gif',
  },
  {
    id: 'gif-high-five',
    title: 'Team High Five',
    category: 'happy',
    keywords: ['high five', 'team', 'congrats', 'friend', 'yes', 'victory'],
    url: 'https://i.giphy.com/3oEjHV0z8S7WM4MwnK.gif',
    previewUrl: 'https://i.giphy.com/3oEjHV0z8S7WM4MwnK.gif',
  },

  // Funny
  {
    id: 'gif-funny-shook',
    title: 'Dramatically Shocked',
    category: 'funny',
    keywords: ['shocked', 'funny', 'drama', 'gasp', 'omg', 'what', 'tea'],
    url: 'https://i.giphy.com/3o72F8t9TDi2xVnxOE.gif',
    previewUrl: 'https://i.giphy.com/3o72F8t9TDi2xVnxOE.gif',
  },
  {
    id: 'gif-funny-giggle',
    title: 'Cannot Stop Laughing',
    category: 'funny',
    keywords: ['laugh', 'lol', 'funny', 'haha', 'giggle', 'smile', 'chuckle'],
    url: 'https://i.giphy.com/l3q2K5jinAlChoCLS.gif',
    previewUrl: 'https://i.giphy.com/l3q2K5jinAlChoCLS.gif',
  },
  {
    id: 'gif-funny-nod',
    title: 'Aggressive Nodding',
    category: 'funny',
    keywords: ['nod', 'yes', 'agree', 'exactly', 'totally', 'relatable', 'yep'],
    url: 'https://i.giphy.com/NEvPzZ8bdvhm8.gif',
    previewUrl: 'https://i.giphy.com/NEvPzZ8bdvhm8.gif',
  },

  // Night
  {
    id: 'gif-night-stars',
    title: 'Starry Goodnight',
    category: 'night',
    keywords: ['night', 'goodnight', 'stars', 'moon', 'sleep', 'dream', 'rest', 'bed'],
    url: 'https://i.giphy.com/3o6Zt481isNVuQI1l6.gif',
    previewUrl: 'https://i.giphy.com/3o6Zt481isNVuQI1l6.gif',
  },
  {
    id: 'gif-night-tuck',
    title: 'Sleepy Blanket Bedtime',
    category: 'night',
    keywords: ['sleepy', 'bed', 'blanket', 'tired', 'tuck', 'night', 'sleep'],
    url: 'https://i.giphy.com/l0MYH8Q83CXvKPSC4.gif',
    previewUrl: 'https://i.giphy.com/l0MYH8Q83CXvKPSC4.gif',
  },
];

// Search verified GIFs instantly across title, category, and keywords
export async function searchGifs(query: string): Promise<GifItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return CURATED_GIFS;

  const matches = CURATED_GIFS.filter(
    (g) =>
      g.title.toLowerCase().includes(trimmed) ||
      g.category.toLowerCase().includes(trimmed) ||
      g.keywords.some((k) => k.toLowerCase().includes(trimmed))
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
