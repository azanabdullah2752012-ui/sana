import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Memory } from '../../types/database';
import { uploadMemoryImage } from '../../lib/storage';
import { useToast } from '../common/Toast';
import { Image, Calendar, MapPin, Tag, Upload, Sparkles, X } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryToEdit?: Memory | null;
  onSave: (memoryData: {
    title: string;
    description: string;
    memory_date: string;
    image_url?: string | null;
    location?: string | null;
    tags?: string[];
  }) => Promise<any>;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memoryToEdit,
  onSave,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memoryToEdit) {
      setTitle(memoryToEdit.title);
      setDescription(memoryToEdit.description);
      setMemoryDate(memoryToEdit.memory_date);
      setLocation(memoryToEdit.location || '');
      setTagsInput(memoryToEdit.tags?.join(', ') || '');
      setImageUrl(memoryToEdit.image_url || null);
    } else {
      setTitle('');
      setDescription('');
      setMemoryDate(new Date().toISOString().split('T')[0]);
      setLocation('');
      setTagsInput('');
      setImageUrl(null);
    }
  }, [memoryToEdit, isOpen]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be under 10MB', 'error');
      return;
    }

    try {
      setUploading(true);
      showToast('Uploading photo to private vault...', 'info');
      const uploadedUrl = await uploadMemoryImage(file);
      setImageUrl(uploadedUrl);
      showToast('Photo uploaded successfully! 📸', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a memory title', 'error');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        memory_date: memoryDate,
        image_url: imageUrl,
        location: location.trim() || null,
        tags,
      });

      showToast(memoryToEdit ? 'Memory updated ✨' : 'Memory added to our scrapbook! 🌸', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save memory', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span>{memoryToEdit ? 'Edit Memory' : 'Preserve a Memory'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Photo Upload / Preview */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Memory Photograph (Optional)
          </label>

          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-cream-200 dark:border-cozydark-800 max-h-52 group">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-52 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-cream-300 dark:border-cozydark-700 hover:border-blush-400 dark:hover:border-blush-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-cream-100/50 dark:bg-cozydark-850/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploading}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blush-100 dark:bg-blush-950/60 flex items-center justify-center text-blush-500 mb-2">
                {uploading ? (
                  <span className="w-5 h-5 border-2 border-blush-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-medium text-cream-800 dark:text-cream-200">
                {uploading ? 'Encrypting & uploading...' : 'Click to upload a cozy snapshot'}
              </p>
              <p className="text-[10px] text-cream-500 dark:text-cream-400 mt-0.5">
                Saved in our private storage vault (PNG, JPG up to 10MB)
              </p>
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rainy Afternoon at the Corner Cafe"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50"
          />
        </div>

        {/* Description / Story */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            The Story &amp; Details
          </label>
          <textarea
            rows={3}
            placeholder="What were we doing? What did we talk about? Why did it feel special?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50"
          />
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="date"
                required
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-cream-900 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="text"
                placeholder="e.g. Botanic Gardens"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Tags (comma separated)
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
            <input
              type="text"
              placeholder="cafe, rainy day, sunset, roadtrip"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-cream-200/80 dark:border-cozydark-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : memoryToEdit ? 'Save Changes' : 'Add to Scrapbook'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
