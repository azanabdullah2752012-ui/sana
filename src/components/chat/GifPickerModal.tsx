import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  GifItem,
  CURATED_GIFS,
  searchGifs,
  getKlipyApiKey,
  setKlipyApiKey,
} from '../../lib/gifs';
import {
  Search,
  Film,
  Sparkles,
  Link as LinkIcon,
  Send,
  Key,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
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
  
  // Klipy API Key Configuration Drawer
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getKlipyApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => Boolean(getKlipyApiKey()));

  const categories = [
    { id: 'all', label: 'All Cozy' },
    { id: 'hugs', label: 'Hugs & Love 💖' },
    { id: 'cats', label: 'Cute Cats 🐱' },
    { id: 'coffee', label: 'Coffee & Tea ☕' },
    { id: 'happy', label: 'Celebrate 🎉' },
    { id: 'funny', label: 'Funny 😂' },
    { id: 'night', label: 'Goodnight 🌙' },
  ];

  // Search effect with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryToUse = searchQuery.trim() || (selectedCategory !== 'all' ? selectedCategory : '');
        const results = await searchGifs(queryToUse);
        setGifResults(results);
      } catch (err) {
        console.error('GIF search error:', err);
        setGifResults(CURATED_GIFS);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen, hasApiKey]);

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    if (!customUrl.startsWith('http')) {
      showToast('Please enter a valid GIF URL (https://...)', 'error');
      return;
    }
    onSelectGif(customUrl.trim());
    setCustomUrl('');
    onClose();
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setKlipyApiKey(apiKeyInput.trim());
    setHasApiKey(Boolean(apiKeyInput.trim()));
    setShowKeyConfig(false);
    showToast(apiKeyInput.trim() ? 'KLIPY API Key connected! 🎬' : 'Using verified curated GIF stream', 'info');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blush-100 dark:bg-blush-950/70 text-blush-600 dark:text-blush-300 flex items-center justify-center shadow-xs">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-semibold text-base sm:text-lg text-cream-900 dark:text-cream-50">
                KLIPY GIF Cinema
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cream-200/60 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300 border border-cream-200 dark:border-cozydark-700">
                Powered by KLIPY
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className={`p-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
              hasApiKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-cream-100 dark:bg-cozydark-800 border-cream-200 dark:border-cozydark-700 text-cream-600 dark:text-cream-300 hover:text-blush-500'
            }`}
            title="Configure KLIPY API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium hidden sm:inline">
              {hasApiKey ? 'KLIPY Connected' : 'KLIPY Key'}
            </span>
          </button>
        </div>
      }
    >
      <div className="space-y-3.5 pt-1">
        {/* Optional KLIPY API Key Configuration Banner */}
        {showKeyConfig && (
          <form
            onSubmit={handleSaveApiKey}
            className="p-3.5 rounded-2xl bg-cream-100/90 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 space-y-2 animate-slide-up"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cream-900 dark:text-cream-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blush-500" />
                <span>KLIPY Developer API Key</span>
              </span>
              <a
                href="https://partner.klipy.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blush-600 dark:text-blush-400 hover:underline flex items-center gap-1"
              >
                <span>Get free key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[11px] text-cream-500 dark:text-cream-400 font-light">
              Enter your KLIPY API key to search billions of live GIFs. Leave empty to use our verified cozy fallback library.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste KLIPY API key here..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 focus:outline-none focus:ring-1 focus:ring-blush-400 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white text-xs font-medium transition-colors"
              >
                Save
              </button>
              {hasApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    setKlipyApiKey('');
                    setHasApiKey(false);
                    showToast('KLIPY API Key cleared', 'info');
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs text-cream-500 hover:text-rose-500 dark:text-cream-400 hover:bg-cream-200 dark:hover:bg-cozydark-750 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400 dark:text-cozydark-500" />
          <input
            type="text"
            placeholder="Search KLIPY GIFs (e.g. hug, cat, coffee, smile, dance)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-200/90 dark:border-cozydark-750 text-xs sm:text-sm text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 focus:outline-none focus:ring-2 focus:ring-blush-400/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cream-400 hover:text-cream-600 dark:hover:text-cream-200 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blush-500 text-white shadow-xs'
                    : 'bg-cream-100 dark:bg-cozydark-850 text-cream-700 dark:text-cream-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-800 border border-cream-200/80 dark:border-cozydark-750'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Direct GIF URL Input */}
        <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream-400 dark:text-cozydark-500" />
            <input
              type="url"
              placeholder="Or paste any GIF link (https://...gif)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-cream-100/50 dark:bg-cozydark-850 border border-cream-200/60 dark:border-cozydark-750 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 focus:outline-none focus:ring-1 focus:ring-blush-400"
            />
          </div>
          <button
            type="submit"
            disabled={!customUrl.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-cream-200 dark:bg-cozydark-800 text-cream-800 dark:text-cream-200 text-xs font-medium hover:bg-blush-500 hover:text-white dark:hover:bg-blush-500 transition-colors disabled:opacity-40"
          >
            Send Link
          </button>
        </form>

        {/* GIF Grid Stream */}
        <div className="max-h-[52vh] max-h-[52dvh] overflow-y-auto pr-1">
          {isSearching ? (
            <div className="py-20 text-center text-cream-400 dark:text-cream-500 text-xs flex flex-col items-center justify-center gap-2.5">
              <span className="w-6 h-6 border-2 border-blush-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-serif">Searching KLIPY...</span>
            </div>
          ) : gifResults.length === 0 ? (
            <div className="py-16 text-center text-cream-500 dark:text-cream-400 text-xs space-y-1">
              <p className="font-medium">No GIFs found for "{searchQuery}".</p>
              <p className="text-[11px] text-cream-400 dark:text-cozydark-400">
                Try searching "hug", "cat", "coffee", or "love"!
              </p>
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
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200/60 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-750 hover:border-blush-400 dark:hover:border-blush-500 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blush-400 shadow-xs"
                  title={gif.title}
                >
                  <img
                    src={gif.previewUrl || gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if preview fails
                      const img = e.currentTarget;
                      if (gif.url && img.src !== gif.url) {
                        img.src = gif.url;
                      }
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-[10px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity text-left">
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
