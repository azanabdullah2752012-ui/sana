import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { ThemePreference, AccentColor } from '../../types/database';
import {
  User,
  Shield,
  Palette,
  LogOut,
  Sparkles,
  Check,
  Lock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    authorizedMember,
    updateProfile,
    signOut,
    isMockMode,
    switchDemoUser,
  } = useAuth();
  const { themePreference, setThemePreference, accentColor, setAccentColor } = useTheme();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, isOpen]);

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

      if (error) throw error;
      showToast('Profile updated successfully! ✨', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out of our space.', 'info');
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
          <span>Profile &amp; Sanctuary Settings</span>
        </div>
      }
    >
      <form onSubmit={handleSaveProfile} className="space-y-6 pt-1">
        
        {/* 1. Profile Section */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blush-400" />
            <span>Profile Details</span>
          </h4>

          {/* Current Avatar & Presets */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-800 mb-4">
            <Avatar
              name={displayName || 'Me'}
              url={avatarUrl}
              size="lg"
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium text-cream-800 dark:text-cream-200 mb-2">
                Choose an Avatar Aesthetic
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {AVATAR_PRESETS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                      avatarUrl === url
                        ? 'border-blush-500 scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105 opacity-80'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    avatarUrl === null
                      ? 'border-blush-500 bg-blush-100 dark:bg-blush-950 text-blush-800 dark:text-blush-200'
                      : 'border-cream-300 dark:border-cozydark-700 text-cream-600'
                  }`}
                >
                  Initials
                </button>
              </div>
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
                className="w-full px-4 py-2 rounded-xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-1 focus:ring-blush-300"
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
                placeholder="A little line that Sana sees..."
                className="w-full px-4 py-2 rounded-xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-xs sm:text-sm text-cream-900 dark:text-cream-50 focus:outline-none focus:ring-1 focus:ring-blush-300"
              />
            </div>
          </div>
        </div>

        {/* 2. Aesthetic & Theme Preferences */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-3 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blush-400" />
            <span>Theme &amp; Accent</span>
          </h4>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {(['light', 'dark', 'system'] as ThemePreference[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemePreference(mode)}
                className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                  themePreference === mode
                    ? 'bg-blush-500 text-white border-blush-500 shadow-sm'
                    : 'bg-cream-100 dark:bg-cozydark-850 border-cream-200 dark:border-cozydark-800 text-cream-700 dark:text-cream-300 hover:bg-cream-200'
                }`}
              >
                {mode === 'system' ? 'System ⚙️' : mode === 'light' ? 'Light ☀️' : 'Dark 🌙'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-cream-600 dark:text-cream-400">Accent:</span>
            {(['blush', 'lavender', 'cream'] as AccentColor[]).map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => setAccentColor(acc)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all ${
                  accentColor === acc
                    ? 'bg-blush-100 text-blush-800 dark:bg-blush-950 dark:text-blush-200 border-blush-300 dark:border-blush-700'
                    : 'bg-cream-100/60 dark:bg-cozydark-850 border-cream-200 dark:border-cozydark-800 text-cream-600'
                }`}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Security & Access Control Information */}
        <div className="p-4 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-cream-900 dark:text-cream-100">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Two-Person Access Status</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
              Approved Member ({authorizedMember?.role || 'member_1'})
            </span>
          </div>

          <p className="text-cream-600 dark:text-cream-400 text-[11px] leading-relaxed">
            All private tables (messages, memories, notes, answers) enforce strict PostgreSQL Row Level Security. Only the two verified accounts are permitted access.
          </p>

          <div className="pt-1 text-[10px] text-cream-500 dark:text-cream-400">
            Current Member: <strong>{profile?.display_name}</strong> (Secret passcode: <code>{profile?.id.includes('azan') ? 'azanisthebest' : 'sanaisthebest'}</code>)
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="p-3 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-800 text-xs">
          <p className="font-semibold text-cream-800 dark:text-cream-200 mb-1 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Persona</span>
          </p>
          <p className="text-[11px] text-cream-600 dark:text-cream-400 mb-2">
            Switch between Azan and Sana to experience the sanctuary from both perspectives:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                switchDemoUser('azan');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-blush-100 dark:bg-blush-950/70 text-blush-800 dark:text-blush-200 font-medium text-xs hover:bg-blush-200 transition-colors"
            >
              Switch to Azan ☕
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoUser('sana');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-lavender-100 dark:bg-lavender-950/70 text-lavender-800 dark:text-lavender-200 font-medium text-xs hover:bg-lavender-200 transition-colors"
            >
              Switch to Sana 🌸
            </button>
          </div>
        </div>

        {/* Action Buttons */}
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
              className="px-4 py-2 rounded-xl text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-medium text-xs shadow-cozy transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
