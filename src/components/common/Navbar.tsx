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
  Settings,
  Heart,
  RefreshCw,
  ShieldCheck,
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
  const { profile, partnerProfile, isMockMode, switchDemoUser } = useAuth();
  const { theme, setThemePreference } = useTheme();

  const toggleTheme = () => {
    setThemePreference(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: Home },
    { id: 'chat' as ActiveTab, label: 'Chat', icon: MessageCircle },
    { id: 'memories' as ActiveTab, label: 'Memories', icon: Camera },
    { id: 'notes' as ActiveTab, label: 'Notes', icon: BookOpen },
    { id: 'activities' as ActiveTab, label: 'Together', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream-50/80 dark:bg-cozydark-950/80 border-b border-cream-200/80 dark:border-cozydark-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blush-300 via-blush-200 to-lavender-200 dark:from-blush-900 dark:to-lavender-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-lg">🌸</span>
            </div>
            <div>
              <div className="font-serif font-semibold text-lg text-cream-900 dark:text-cream-50 leading-tight flex items-center gap-1.5">
                Sana &amp; Me
                <Heart className="w-3.5 h-3.5 text-blush-400 fill-blush-400 inline-block animate-pulse-subtle" />
              </div>
              <p className="text-[10px] tracking-wider uppercase text-cream-500 dark:text-cream-400 font-medium">
                Our Private Space
              </p>
            </div>
          </button>

          {/* Quick Persona Switcher pill */}
          <div className="hidden lg:flex items-center ml-2">
            <button
              onClick={() => switchDemoUser(profile?.id.includes('azan') ? 'sana' : 'azan')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blush-100/70 dark:bg-blush-950/50 text-blush-700 dark:text-blush-300 border border-blush-200 dark:border-blush-800 hover:bg-blush-200/70 transition-colors"
              title="Click to switch between Azan and Sana instantly"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Viewing as <strong>{profile?.display_name || 'Azan'}</strong> (Switch)</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-cream-200/50 dark:bg-cozydark-900/60 p-1 rounded-full border border-cream-200/70 dark:border-cozydark-800/70">
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

        {/* Right Actions: Partner presence, Theme toggle, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Partner Status Pill */}
          {partnerProfile && (
            <div
              onClick={() => setActiveTab('chat')}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-cream-100/90 dark:bg-cozydark-850 border border-cream-200 dark:border-cozydark-800 text-xs cursor-pointer hover:border-blush-300 dark:hover:border-blush-700 transition-colors"
              title={`Say hi to ${partnerProfile.display_name}`}
            >
              <Avatar
                name={partnerProfile.display_name}
                url={partnerProfile.avatar_url}
                size="xs"
                showStatus={true}
                isOnline={true}
              />
              <span className="text-cream-700 dark:text-cream-300 font-medium">
                {partnerProfile.display_name}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-cream-600 dark:text-cream-300 hover:bg-cream-200/60 dark:hover:bg-cozydark-800 transition-colors"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cream-600" />}
          </button>

          {/* User Profile & Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blush-300/50 dark:hover:ring-blush-600/50 transition-all"
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg bg-cream-50/95 dark:bg-cozydark-950/95 border-t border-cream-200/80 dark:border-cozydark-800/80 py-1.5 px-3 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-blush-600 dark:text-blush-300'
                  : 'text-cream-500 dark:text-cream-400'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-all ${
                  isActive ? 'bg-blush-100 dark:bg-cozydark-800 text-blush-600 dark:text-blush-300' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
