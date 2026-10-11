import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from './Avatar';
import {
  Home,
  MessageCircle,
  Camera,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Heart,
  Settings,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'chat' | 'memories' | 'notes' | 'activities';

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

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    updateProfile({ theme_preference: next }).catch(() => {});
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: Home },
    { id: 'chat' as ActiveTab, label: 'Chat', icon: MessageCircle },
    { id: 'memories' as ActiveTab, label: 'Memories', icon: Camera },
    { id: 'notes' as ActiveTab, label: 'Notes', icon: BookOpen },
    { id: 'activities' as ActiveTab, label: 'Together', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-cream-50/85 dark:bg-cozydark-950/85 border-b border-cream-200/80 dark:border-cozydark-750 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left active:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-blush-300 via-blush-200 to-lavender-200 dark:from-blush-900 dark:to-lavender-900 flex items-center justify-center shadow-xs">
              <span className="text-base sm:text-lg">🌸</span>
            </div>
            <div>
              <div className="font-serif font-semibold text-base sm:text-lg text-cream-900 dark:text-cream-50 leading-tight flex items-center gap-1.5">
                Sana &amp; Me
                <Heart className="w-3 h-3 text-blush-400 fill-blush-400 inline-block animate-pulse-subtle" />
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-wider uppercase text-cream-500 dark:text-cream-400 font-medium">
                Our Private Space
              </p>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-cream-200/50 dark:bg-cozydark-900/60 p-1 rounded-full border border-cream-200/70 dark:border-cozydark-750">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cream-50 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300 shadow-sm'
                      : 'text-cream-600 dark:text-cream-400 hover:text-cream-900 dark:hover:text-cream-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blush-500 dark:text-blush-300' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Partner Pill, Theme, Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Partner Pill (Desktop & Tablet) */}
            {partnerProfile && (
              <div
                onClick={() => setActiveTab('chat')}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cream-100/90 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-750 text-xs cursor-pointer hover:border-blush-300 dark:hover:border-blush-700 transition-colors"
                title={`Chat with ${partnerProfile.display_name} (${isPartnerOnline ? 'Online' : 'Offline'})`}
              >
                <Avatar
                  name={partnerProfile.display_name}
                  url={partnerProfile.avatar_url}
                  size="xs"
                  showStatus={true}
                  isOnline={isPartnerOnline}
                />
                <span className="text-cream-700 dark:text-cream-300 font-medium text-xs flex items-center gap-1.5">
                  {partnerProfile.display_name}
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isPartnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-cream-400 dark:bg-cozydark-600'
                    }`}
                  />
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-full text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 transition-colors active:scale-95"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to Light mode ☀️' : 'Switch to Dark mode 🌙'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300 animate-spin-once" /> : <Moon className="w-4 h-4 text-cream-600 dark:text-cream-300" />}
            </button>

            {/* Profile Avatar & Settings trigger */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-blush-300/50 dark:hover:ring-blush-600/50 transition-all active:scale-95"
              aria-label="Open settings"
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

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-cream-50/95 dark:bg-cozydark-950/95 border-t border-cream-200/80 dark:border-cozydark-750 px-2 py-1 flex justify-around items-center shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-blush-600 dark:text-blush-300 font-semibold'
                  : 'text-cream-500 dark:text-cream-400 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-blush-100 dark:bg-cozydark-800 scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
