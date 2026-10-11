import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { GifItem, CURATED_GIFS, searchGifs } from '../../lib/gifs';
import { Search, Film, Sparkles, Link as LinkIcon, Send } from 'lucide-react';
import { useToast } from '../common/Toast';

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (url: string) => void;
}

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [gifResults, setGifResults] = useState<GifItem[]>(CURATED_GIFS);
  const [isSearching, setIsSearching] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const categories = [
    { id: 'all', label: 'All Cozy' },
    { id: 'hugs', label: 'Hugs & Love 💖' },
    { id: 'cats', label: 'Cute Cats 🐱' },
    { id: 'coffee', label: 'Coffee & Cozy ☕' },
    { id: 'happy', label: 'Celebrate 🎉' },
    { id: 'funny', label: 'Funny 😂' },
    { id: 'night', label: 'Goodnight 🌙' },
  ];

  // Search effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results = await searchGifs(searchQuery);
        if (selectedCategory !== 'all' && !searchQuery.trim()) {
          results = results.filter((g) => g.category === selectedCategory);
        }
        setGifResults(results);
      } catch {
        setGifResults(CURATED_GIFS);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen]);

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    if (!customUrl.startsWith('http')) {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    onSelectGif(customUrl.trim());
    setCustomUrl('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-blush-400" />
          <span>GIF Cinema</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
          <input
            type="text"
            placeholder="Search GIFs (e.g. hug, cat, coffee, love, dance)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-200/90 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300"
          />
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id && !searchQuery
                  ? 'bg-blush-500 text-white shadow-xs'
                  : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Direct GIF URL Input */}
        <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream-400" />
            <input
              type="url"
              placeholder="Or paste direct GIF link (https://...gif)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-cream-100/50 dark:bg-cozydark-850 border border-cream-200/60 dark:border-cozydark-800 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-300"
            />
          </div>
          <button
            type="submit"
            disabled={!customUrl.trim()}
            className="px-3 py-1.5 rounded-xl bg-cream-200 dark:bg-cozydark-750 text-cream-800 dark:text-cream-200 text-xs font-medium hover:bg-blush-500 hover:text-white transition-colors disabled:opacity-40"
          >
            Send Link
          </button>
        </form>

        {/* GIF Grid */}
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {isSearching ? (
            <div className="py-16 text-center text-cream-400 text-xs flex flex-col items-center gap-2">
              <span className="w-5 h-5 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
              <span>Finding cozy GIFs...</span>
            </div>
          ) : gifResults.length === 0 ? (
            <div className="py-16 text-center text-cream-400 text-xs">
              No GIFs found for "{searchQuery}". Try searching "hug", "cat", or "coffee"!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {gifResults.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200/70 dark:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-750 hover:border-blush-400 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blush-400"
                  title={gif.title}
                >
                  <img
                    src={gif.previewUrl || gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent text-[10px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity text-left">
                    {gif.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
