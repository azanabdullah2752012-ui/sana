import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from './Avatar';
import { InstallPwaModal } from './InstallPwaModal';
import {
  MessageCircle,
  Camera,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
  Circle,
} from 'lucide-react';

export type ActiveTab = 'chat' | 'memories' | 'notes' | 'activities';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const { profile, partnerProfile, isPartnerOnline, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    updateProfile({ theme_preference: next }).catch(() => {});
  };

  const navItems = [
    { id: 'chat' as ActiveTab, label: 'Chat', icon: MessageCircle },
    { id: 'memories' as ActiveTab, label: 'Moments', icon: Camera },
    { id: 'notes' as ActiveTab, label: 'Notes', icon: BookOpen },
    { id: 'activities' as ActiveTab, label: 'Together', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#0A090D]/85 border-b border-cream-200/80 dark:border-cozydark-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          
          {/* Left: Partner Status Header (Signal/Telegram Style) */}
          <div
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-3 cursor-pointer group active:opacity-85 select-none"
            title={`Chat with ${partnerProfile?.display_name || 'Bestie'}`}
          >
            <div className="relative">
              <Avatar
                name={partnerProfile?.display_name || 'Bestie'}
                url={partnerProfile?.avatar_url}
                size="md"
                showStatus={false}
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-cozydark-950 transition-colors ${
                  isPartnerOnline
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                    : 'bg-cream-400 dark:bg-cozydark-650'
                }`}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-serif font-semibold text-sm sm:text-base text-cream-950 dark:text-cream-50 group-hover:text-blush-500 transition-colors">
                  {partnerProfile?.display_name || 'Bestie'}
                </span>
                <span className="text-[10px] text-cream-400 dark:text-cream-500 font-mono">
                  &amp; me
                </span>
              </div>
              <span className="text-[11px] font-medium transition-colors">
                {isPartnerOnline ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    online now
                  </span>
                ) : (
                  <span className="text-cream-400 dark:text-cream-500">
                    offline
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Segmented Floating Pill) */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-100/90 dark:bg-cozydark-900/90 p-1 rounded-2xl border border-cream-200/90 dark:border-cozydark-750 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-cozydark-800 text-blush-600 dark:text-blush-300 shadow-xs font-semibold'
                      : 'text-cream-600 dark:text-cream-400 hover:text-cream-900 dark:hover:text-cream-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blush-500 dark:text-blush-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: PWA, Theme, Profile Settings */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Install PWA */}
            <button
              onClick={() => setInstallModalOpen(true)}
              className="p-2 rounded-xl text-cream-600 dark:text-cream-400 hover:bg-cream-100 dark:hover:bg-cozydark-850 transition-colors"
              aria-label="Add to Home Screen"
              title="Add to Home Screen 📱"
            >
              <Smartphone className="w-4 h-4 text-blush-500 dark:text-blush-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl text-cream-600 dark:text-cream-400 hover:bg-cream-100 dark:hover:bg-cozydark-850 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to Light mode ☀️' : 'Switch to Dark mode 🌙'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* My Profile / Settings */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blush-400/50 transition-all active:scale-95"
              aria-label="Open settings"
              title="Profile & Settings"
            >
              <Avatar
                name={profile?.display_name || 'Me'}
                url={profile?.avatar_url}
                size="sm"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (iOS / Telegram Floating Style) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-[#0A090D]/95 border-t border-cream-200/80 dark:border-cozydark-800 px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex justify-around items-center shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-all ${
                isActive
                  ? 'text-blush-600 dark:text-blush-400 font-semibold'
                  : 'text-cream-500 dark:text-cream-400'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-blush-100/80 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Install PWA Modal */}
      <InstallPwaModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </>
  );
};
