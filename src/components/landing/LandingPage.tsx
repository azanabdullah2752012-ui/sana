import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../common/Toast';
import {
  Heart,
  MessageCircle,
  Camera,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { signInWithPasscode, isSchemaReady } = useAuth();
  const { theme, setThemePreference } = useTheme();
  const { showToast } = useToast();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setThemePreference(theme === 'dark' ? 'light' : 'dark');
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      showToast('Please enter your secret passcode', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error, user } = await signInWithPasscode(passcode.trim());
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Welcome home, ${user?.display_name}! 🌸✨`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Incorrect passcode', 'error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Private Realtime Chat',
      desc: 'One shared thread with message replies, emoji reactions, and edits.',
      color: 'bg-blush-100 text-blush-600 dark:bg-blush-950/60 dark:text-blush-300',
    },
    {
      icon: Camera,
      title: 'Digital Scrapbook',
      desc: 'Save real photos, dates, and memories in a dedicated album.',
      color: 'bg-lavender-100 text-lavender-600 dark:bg-lavender-950/60 dark:text-lavender-300',
    },
    {
      icon: BookOpen,
      title: 'Shared Notebook',
      desc: 'Inside jokes, checklists, and things to discuss over coffee.',
      color: 'bg-cream-200 text-cream-800 dark:bg-cozydark-800 dark:text-cream-200',
    },
    {
      icon: Sparkles,
      title: 'Daily Reflections & Bucket List',
      desc: 'Answer cozy daily prompts together and check off shared adventures.',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-cream-50 dark:bg-cozydark-950 text-cream-900 dark:text-cream-100 transition-colors relative overflow-x-hidden flex flex-col justify-between selection:bg-blush-200">
      
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-blush-200/40 dark:bg-blush-900/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-40 right-4 sm:right-10 w-64 sm:w-80 h-64 sm:h-80 bg-lavender-200/40 dark:bg-lavender-900/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blush-300 via-blush-200 to-lavender-200 dark:from-blush-900 dark:to-lavender-900 flex items-center justify-center shadow-sm">
            <span className="text-xl">🌸</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg sm:text-xl text-cream-900 dark:text-cream-50 leading-tight">
              Sana &amp; Me
            </h1>
            <p className="text-[10px] sm:text-[11px] text-cream-500 dark:text-cream-400 font-medium">
              Best Friends Sanctuary
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-cream-100 dark:bg-cozydark-900 border border-cream-200 dark:border-cozydark-800 text-cream-600 dark:text-cream-300 hover:bg-cream-200/70 dark:hover:bg-cozydark-800 transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 text-center flex-1 flex flex-col justify-center items-center w-full">
        
        {/* Schema setup warning if tables not yet created */}
        {!isSchemaReady && (
          <div className="w-full max-w-lg mx-auto mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs text-left shadow-sm">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Supabase Connected — Run Schema SQL</span>
            </p>
            <p className="opacity-90 leading-relaxed text-[11px]">
              Execute <code className="bg-amber-200/60 dark:bg-amber-900 px-1 py-0.5 rounded">supabase/schema.sql</code> in your Supabase SQL Editor to initialize your database tables.
            </p>
          </div>
        )}

        {/* Soft Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush-100/70 dark:bg-blush-950/60 border border-blush-200/80 dark:border-blush-800/80 text-blush-700 dark:text-blush-300 text-xs font-medium mb-5 sm:mb-6 animate-fade-in shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blush-400 animate-pulse-subtle" />
          <span>Best Friends Sanctuary • Sana &amp; Azan</span>
        </div>

        {/* Main Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-cream-900 dark:text-cream-50 font-normal leading-[1.2] max-w-2xl mb-4 sm:mb-6 tracking-tight">
          Where our little moments, thoughts, and memories live.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-cream-600 dark:text-cream-300 max-w-xl font-light leading-relaxed mb-8 sm:mb-10 px-2">
          A soft, peaceful sanctuary designed just for two best friends. Free of noise, distractions, or algorithms.
        </p>

        {/* Inline Mobile-Friendly Secret Passcode Entrance */}
        <div className="w-full max-w-md p-5 sm:p-7 rounded-3xl sm:rounded-4xl bg-cream-50/95 dark:bg-cozydark-900/95 border border-cream-200/90 dark:border-cozydark-750 shadow-cozy-lg dark:shadow-cozy-dark-lg mb-10 sm:mb-14">
          <form onSubmit={handleUnlock} className="space-y-3.5">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400 dark:text-cozydark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter secret passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-750 text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-600 dark:hover:text-cream-200 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 active:scale-[0.99] text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Sanctuary</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-cream-500 dark:text-cream-400 text-center mt-3 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Private two-person gateway • Session saved on device</span>
          </p>
        </div>

        {/* Feature Cards Grid (Mobile 1-col, Desktop 4-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full max-w-5xl">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-cream-100/70 dark:bg-cozydark-900/80 border border-cream-200/80 dark:border-cozydark-750 shadow-cozy dark:shadow-cozy-dark"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${feat.color} flex items-center justify-center mb-3 shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-medium text-base text-cream-900 dark:text-cream-50 mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-cream-600 dark:text-cream-400 leading-relaxed font-light">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full text-center text-[11px] text-cream-500 dark:text-cream-400 border-t border-cream-200/60 dark:border-cozydark-850/60">
        <p>Built for besties Sana &amp; Azan • Powered by React, Vite, Tailwind CSS &amp; Supabase</p>
      </footer>
    </div>
  );
};
