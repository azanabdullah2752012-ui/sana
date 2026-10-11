import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Sticker,
  DEFAULT_STICKERS,
  getCustomStickers,
  saveCustomSticker,
  deleteCustomSticker,
} from '../../lib/stickers';
import { uploadMemoryImage } from '../../lib/storage';
import { useToast } from '../common/Toast';
import { Plus, Trash2, Sparkles, Image as ImageIcon, Heart, Coffee, Croissant, Compass } from 'lucide-react';

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Sticker) => void;
}

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customList, setCustomList] = useState<Sticker[]>([]);
  
  // Custom sticker creation state
  const [isUploading, setIsUploading] = useState(false);
  const [newStickerName, setNewStickerName] = useState('');
  const [newStickerFile, setNewStickerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const reloadCustomStickers = () => {
    setCustomList(getCustomStickers());
  };

  useEffect(() => {
    if (isOpen) {
      reloadCustomStickers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => reloadCustomStickers();
    window.addEventListener('sana_stickers_updated', handleUpdate);
    return () => window.removeEventListener('sana_stickers_updated', handleUpdate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Sticker file must be under 8MB', 'error');
      return;
    }
    setNewStickerFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateCustomSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickerFile) {
      showToast('Please select a photo or cutout for your sticker', 'error');
      return;
    }

    try {
      setIsUploading(true);
      showToast('Saving custom sticker to vault...', 'info');
      const uploadedUrl = await uploadMemoryImage(newStickerFile);
      const name = newStickerName.trim() || newStickerFile.name.replace(/\.[^/.]+$/, '');
      const saved = saveCustomSticker(name, uploadedUrl);
      
      setNewStickerName('');
      setNewStickerFile(null);
      setPreviewUrl(null);
      showToast('Custom sticker saved! 🌸', 'success');
      
      // Immediately select and send!
      onSelectSticker(saved);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save sticker', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCustomSticker(id);
    showToast('Sticker removed', 'info');
  };

  const categories = [
    { id: 'all', label: 'All Stickers' },
    { id: 'cozy', label: 'Cozy ☕' },
    { id: 'sweet', label: 'Sweet 💖' },
    { id: 'treats', label: 'Treats 🥐' },
    { id: 'vibes', label: 'Vibes ✨' },
  ];

  const displayedPresets = DEFAULT_STICKERS.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span>Sticker Vault</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Main Tab Toggle */}
        <div className="flex rounded-2xl bg-cream-100 dark:bg-cozydark-850 p-1 border border-cream-200 dark:border-cozydark-750">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-cozydark-750 text-blush-600 dark:text-blush-300 shadow-xs'
                : 'text-cream-600 dark:text-cream-400 hover:text-cream-900'
            }`}
          >
            Cozy Pack ({DEFAULT_STICKERS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-cozydark-750 text-blush-600 dark:text-blush-300 shadow-xs'
                : 'text-cream-600 dark:text-cream-400 hover:text-cream-900'
            }`}
          >
            My Custom Stickers ({customList.length})
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blush-500 text-white shadow-xs'
                      : 'bg-cream-100 dark:bg-cozydark-850 text-cream-600 dark:text-cream-300 hover:bg-cream-200/80 dark:hover:bg-cozydark-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sticker Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {displayedPresets.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => {
                    onSelectSticker(stk);
                    onClose();
                  }}
                  className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850/80 hover:bg-blush-50 dark:hover:bg-blush-950/40 border border-cream-200/80 dark:border-cozydark-750 hover:border-blush-300 dark:hover:border-blush-700 transition-all transform active:scale-95"
                  title={stk.name}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-white/60 dark:bg-black/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <img
                      src={stk.imageUrl}
                      alt={stk.name}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-cream-800 dark:text-cream-200 truncate max-w-full text-center">
                    {stk.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Stickers */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {/* Upload Creator Card */}
            <form
              onSubmit={handleCreateCustomSticker}
              className="p-3.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-200/90 dark:border-cozydark-750 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blush-500" />
                <span className="font-serif text-xs font-semibold text-cream-900 dark:text-cream-100">
                  Add Your Own Sticker
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="w-full sm:w-28 h-20 rounded-xl border-2 border-dashed border-cream-300 dark:border-cozydark-700 hover:border-blush-400 bg-white dark:bg-cozydark-800 flex flex-col items-center justify-center cursor-pointer shrink-0 overflow-hidden relative group">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-cream-400 mb-0.5" />
                      <span className="text-[10px] text-cream-500">Pick image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    placeholder="Sticker name (e.g. Sana Laughing, Azan's Coffee)..."
                    value={newStickerName}
                    onChange={(e) => setNewStickerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 focus:outline-none focus:ring-1 focus:ring-blush-400"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !newStickerFile}
                    className="w-full py-2 px-3 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isUploading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save &amp; Send Sticker</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Custom Stickers List */}
            {customList.length === 0 ? (
              <div className="py-10 text-center text-cream-400 dark:text-cream-500 text-xs font-light">
                No custom stickers uploaded yet. Turn any photo, funny face, or drawing into a sticker!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {customList.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => {
                      onSelectSticker(stk);
                      onClose();
                    }}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850/80 hover:bg-blush-50 dark:hover:bg-blush-950/40 border border-cream-200/80 dark:border-cozydark-750 hover:border-blush-300 dark:hover:border-blush-700 transition-all cursor-pointer transform active:scale-95"
                  >
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustom(e, stk.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-cream-200/80 dark:bg-cozydark-700 text-cream-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete sticker"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-white/60 dark:bg-black/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <img
                        src={stk.imageUrl}
                        alt={stk.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-cream-800 dark:text-cream-200 truncate max-w-full text-center">
                      {stk.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
