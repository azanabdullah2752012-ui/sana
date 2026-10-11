import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, WALLPAPER_PRESETS, WallpaperId } from '../../contexts/ThemeContext';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { uploadMemoryImage, optimizeAvatarImage } from '../../lib/storage';
import { ThemePreference } from '../../types/database';
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
  Sun,
  Moon,
  Monitor,
  Trash2,
  Image as ImageIcon,
  Smartphone,
} from 'lucide-react';
import { InstallPwaModal } from '../common/InstallPwaModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    signOut,
  } = useAuth();
  const {
    themePreference,
    setThemePreference,
    wallpaper,
    setWallpaper,
    customWallpaperUrl,
    setCustomWallpaperUrl,
  } = useTheme();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [klipyApiKeyInput, setKlipyApiKeyInput] = useState(() => getKlipyApiKey());
  const [installModalOpen, setInstallModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile?.display_name || '');
      setBio(profile?.bio || '');
      setAvatarUrl(profile?.avatar_url || null);
      setKlipyApiKeyInput(getKlipyApiKey());
    }
  }, [isOpen, profile]);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('Image size must be under 25MB', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      showToast('Optimizing and saving photo...', 'info');
      const optimizedUrl = await optimizeAvatarImage(file);
      setAvatarUrl(optimizedUrl);

      // Auto-save immediately so reload never resets photo!
      await updateProfile({ avatar_url: optimizedUrl });
      showToast('Profile photo updated! ✨', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update photo', 'error');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl(null);
    await updateProfile({ avatar_url: null });
    showToast('Profile photo removed ✨', 'info');
  };

  const handleSelectMode = (mode: ThemePreference) => {
    setThemePreference(mode);
    updateProfile({ theme_preference: mode }).catch(() => {});
  };

  const handleSelectWallpaper = (id: WallpaperId) => {
    setWallpaper(id);
    const item = WALLPAPER_PRESETS.find((p) => p.id === id);
    showToast(`Atmosphere set to ${item?.name || id} ✨`, 'info');
  };

  const handleCustomWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('Image size must be under 20MB', 'error');
      return;
    }

    try {
      showToast('Setting custom bestie wallpaper...', 'info');
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCustomWallpaperUrl(result);
          setWallpaper('custom');
          showToast('Our Bestie Photo set as wallpaper! 📸✨', 'success');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Failed to set wallpaper', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveCustomWallpaper = () => {
    setCustomWallpaperUrl(null);
    setWallpaper('minimal');
    showToast('Custom wallpaper removed. Back to Clean Minimal ✨', 'info');
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
    <>
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
                  onClick={handleRemovePhoto}
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
                Bio / Personal Note
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add a bio or personal note..."
                className="w-full px-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-blush-300"
              />
            </div>
          </div>
        </div>

        {/* 2. Theme & Sanctuary Wallpaper Atmosphere */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blush-400" />
              <span>Sanctuary Atmosphere &amp; Wallpaper</span>
            </h4>
            <span className="text-[11px] text-cream-500 dark:text-cream-400 font-normal">
              Instant live preview ✨
            </span>
          </div>

          {/* Light / Dark Mode Segmented Switcher */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-cream-700 dark:text-cream-300 mb-1.5">
              Appearance Mode
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-cream-200/60 dark:bg-cozydark-850 border border-cream-300/60 dark:border-cozydark-750">
              {[
                { id: 'light' as ThemePreference, label: 'Light', icon: Sun },
                { id: 'dark' as ThemePreference, label: 'Dark', icon: Moon },
                { id: 'system' as ThemePreference, label: 'System', icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = themePreference === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMode(item.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-cozydark-700 text-cream-950 dark:text-cream-50 shadow-xs font-semibold ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-cream-600 dark:text-cream-400 hover:text-cream-900 dark:hover:text-cream-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-cream-700 dark:text-cream-300">
                Atmosphere Background:
              </label>
              <span className="text-[11px] font-medium text-blush-500 dark:text-blush-400">
                {WALLPAPER_PRESETS.find((p) => p.id === wallpaper)?.name || 'Custom Photo'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WALLPAPER_PRESETS.map((preset) => {
                const isSelected = wallpaper === preset.id;
                const isCustom = preset.id === 'custom';

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      if (!isCustom) {
                        handleSelectWallpaper(preset.id);
                      } else if (customWallpaperUrl) {
                        handleSelectWallpaper('custom');
                      }
                    }}
                    className={`relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-cozydark-800 border-blush-500 dark:border-blush-400 ring-2 ring-blush-400/30 shadow-xs'
                        : 'bg-cream-100/70 dark:bg-cozydark-850/70 border-cream-200/90 dark:border-cozydark-750 hover:bg-cream-200/50 dark:hover:bg-cozydark-800/60'
                    }`}
                  >
                    {/* Visual Thumbnail */}
                    <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-cream-300/80 dark:border-cozydark-700 shadow-2xs">
                      {isCustom && customWallpaperUrl ? (
                        <img
                          src={customWallpaperUrl}
                          alt="Custom Bestie Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : preset.url ? (
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${preset.thumbGradient}`} />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center text-sm bg-black/20 select-none">
                        {preset.emoji}
                      </span>
                    </div>

                    {/* Information & Action */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-cream-900 dark:text-cream-50 truncate">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-cream-500 dark:text-cream-400 truncate">
                        {isCustom && customWallpaperUrl
                          ? 'Custom photo active'
                          : preset.subtitle}
                      </p>

                      {isCustom && (
                        <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                          <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cream-200/70 dark:bg-cozydark-750 text-[10px] font-medium text-cream-700 dark:text-cream-200 hover:bg-cream-300/70 transition-colors cursor-pointer">
                            <Upload className="w-2.5 h-2.5" />
                            <span>{customWallpaperUrl ? 'Change' : 'Upload Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCustomWallpaperUpload}
                              className="hidden"
                            />
                          </label>
                          {customWallpaperUrl && (
                            <button
                              type="button"
                              onClick={handleRemoveCustomWallpaper}
                              className="text-[10px] text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                              title="Remove custom wallpaper"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {isSelected ? (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-blush-500 dark:bg-blush-400 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="shrink-0 w-4 h-4 rounded-full border border-cream-300 dark:border-cozydark-700" />
                    )}
                  </div>
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

        {/* 4. Mobile App & Home Screen */}
        <div className="p-3.5 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blush-100 dark:bg-blush-950/70 border border-blush-200 dark:border-blush-800 flex items-center justify-center text-blush-500 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-serif font-semibold text-xs text-cream-900 dark:text-cream-100">
                Install Mobile App
              </h5>
              <p className="text-[10px] text-cream-500 dark:text-cream-400">
                Add to your iPhone or Android Home Screen with custom 🌸 icon
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInstallModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-cozydark-800 border border-cream-200 dark:border-cozydark-700 text-xs font-medium text-cream-800 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-cozydark-750 transition-colors shadow-2xs"
          >
            Install
          </button>
        </div>

        {/* 5. Security Status Badge */}
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
    <InstallPwaModal
      isOpen={installModalOpen}
      onClose={() => setInstallModalOpen(false)}
    />
    </>
  );
};
