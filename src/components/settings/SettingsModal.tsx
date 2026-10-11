import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { uploadMemoryImage } from '../../lib/storage';
import { ThemePreference, AccentColor } from '../../types/database';
import { getKlipyApiKey, setKlipyApiKey } from '../../lib/gifs';
import {
  User,
  Shield,
  Palette,
  LogOut,
  Sparkles,
  Upload,
  Camera,
  Check,
  Film,
  Key,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { id: AccentColor; label: string; bg: string }[] = [
  { id: 'blush', label: 'Blush Pink', bg: 'bg-[#F68CAE]' },
  { id: 'rose', label: 'Dusty Rose', bg: 'bg-[#F43F5E]' },
  { id: 'lavender', label: 'Lavender', bg: 'bg-[#BA9BF0]' },
  { id: 'violet', label: 'Royal Violet', bg: 'bg-[#8B5CF6]' },
  { id: 'cream', label: 'Toasted Cream', bg: 'bg-[#B88E6D]' },
  { id: 'peach', label: 'Warm Peach', bg: 'bg-[#FB923C]' },
  { id: 'mint', label: 'Sage Mint', bg: 'bg-[#10B981]' },
  { id: 'sky', label: 'Soft Sky', bg: 'bg-[#0EA5E9]' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    signOut,
  } = useAuth();
  const { themePreference, setThemePreference, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [klipyApiKeyInput, setKlipyApiKeyInput] = useState(() => getKlipyApiKey());

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
      setKlipyApiKeyInput(getKlipyApiKey());
    }
  }, [profile, isOpen]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must be under 10MB', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      showToast('Uploading custom profile photo...', 'info');
      const url = await uploadMemoryImage(file);
      setAvatarUrl(url);
      showToast('Profile photo uploaded! ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Display name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        theme_preference: themePreference,
        accent_color: accentColor,
      });

      setKlipyApiKey(klipyApiKeyInput.trim());

      if (error) throw error;
      showToast('Profile and preferences updated! ✨', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out of sanctuary.', 'info');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span>Profile &amp; Appearance</span>
        </div>
      }
    >
      <form onSubmit={handleSaveProfile} className="space-y-6 pt-1">
        
        {/* 1. Custom Profile Photo Upload */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blush-400" />
            <span>Profile Photo &amp; Details</span>
          </h4>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-800 mb-4">
            <div className="relative group">
              <Avatar
                name={displayName || 'Me'}
                url={avatarUrl}
                size="xl"
              />
              <label className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5" />
                <span className="text-[9px] mt-0.5">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs font-medium text-cream-800 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-cozydark-750 transition-colors cursor-pointer shadow-xs">
                {uploadingAvatar ? (
                  <span className="w-3.5 h-3.5 border-2 border-blush-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-blush-500" />
                )}
                <span>{uploadingAvatar ? 'Uploading...' : 'Upload Real Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="ml-2 text-[11px] text-cream-500 hover:text-rose-500 underline"
                >
                  Remove Photo
                </button>
              )}

              <p className="text-[10px] text-cream-400 mt-1.5 font-light">
                Stored in our private encrypted vault. Tap to take a photo or select from library.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-blush-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1">
                Bio / Cozy Note
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A little note your friend sees..."
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-blush-300"
              />
            </div>
          </div>
        </div>

        {/* 2. Theme & Custom Accent Colors */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-3 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blush-400" />
            <span>Theme &amp; Accent Palette</span>
          </h4>

          {/* Light / Dark Mode */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['light', 'dark', 'system'] as ThemePreference[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemePreference(mode)}
                className={`py-2 px-3 rounded-2xl text-xs font-medium capitalize border transition-all ${
                  themePreference === mode
                    ? 'bg-blush-500 text-white border-blush-500 shadow-sm'
                    : 'bg-cream-100 dark:bg-cozydark-850 border-cream-200 dark:border-cozydark-800 text-cream-700 dark:text-cream-300'
                }`}
              >
                {mode === 'system' ? 'System ⚙️' : mode === 'light' ? 'Light ☀️' : 'Dark 🌙'}
              </button>
            ))}
          </div>

          {/* Extended Accent Palettes */}
          <div>
            <label className="block text-xs font-medium text-cream-600 dark:text-cream-400 mb-2">
              Color Accent:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ACCENT_COLORS.map((col) => {
                const isSelected = accentColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setAccentColor(col.id)}
                    className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-cream-800 dark:border-white bg-cream-100 dark:bg-cozydark-800 font-semibold shadow-xs'
                        : 'border-cream-200/80 dark:border-cozydark-800 hover:bg-cream-100/50'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${col.bg} shrink-0`} />
                    <span className="text-xs text-cream-800 dark:text-cream-200">{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. KLIPY GIF Cinema Integration */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-2 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-blush-400" />
            <span>KLIPY GIF Engine</span>
          </h4>

          <div className="p-3.5 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-750 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs font-medium text-cream-800 dark:text-cream-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blush-500" />
                <span>KLIPY API Key</span>
              </span>
              <a
                href="https://partner.klipy.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blush-600 dark:text-blush-400 hover:underline"
              >
                Get API key ↗
              </a>
            </div>

            <input
              type="text"
              placeholder="Paste KLIPY Partner API key (optional)..."
              value={klipyApiKeyInput}
              onChange={(e) => setKlipyApiKeyInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 font-mono focus:outline-none focus:ring-1 focus:ring-blush-400"
            />
            <p className="text-[10px] text-cream-500 dark:text-cream-400 font-light">
              Powers real-time GIF search and trending reactions in the chat.
            </p>
          </div>
        </div>

        {/* 4. Security Status Badge */}
        <div className="p-4 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-750 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-cream-900 dark:text-cream-100">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Two-Person Space</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
              Verified Member
            </span>
          </div>
          <p className="text-cream-600 dark:text-cream-400 text-[11px] leading-relaxed">
            Logged in as <strong>{profile?.display_name}</strong>. Real-time updates and private media active.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-cream-200/80 dark:border-cozydark-800">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-medium text-xs shadow-cozy transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
