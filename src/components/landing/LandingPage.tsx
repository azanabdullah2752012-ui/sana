import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthModal } from './AuthModal';
import {
  Heart,
  MessageCircle,
  Camera,
  BookOpen,
  Sparkles,
  Shield,
  Sun,
  Moon,
  ArrowRight,
  Coffee,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchDemoUser, isMockMode, isSchemaReady } = useAuth();
  const { theme, setThemePreference } = useTheme();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const toggleTheme = () => {
    setThemePreference(theme === 'dark' ? 'light' : 'dark');
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-Time Intimate Chat',
      desc: 'One shared thread for quick thoughts, emoji reactions, message replies, and edits.',
      color: 'bg-blush-100 text-blush-600 dark:bg-blush-950/60 dark:text-blush-300',
    },
    {
      icon: Camera,
      title: 'Scrapbook Memories',
      desc: 'Cherished cafe photos, trips, and milestones stored securely in a private album.',
      color: 'bg-lavender-100 text-lavender-600 dark:bg-lavender-950/60 dark:text-lavender-300',
    },
    {
      icon: BookOpen,
      title: 'Shared Notebook',
      desc: 'Inside jokes, checklists, book clubs, and late-night thoughts kept in one synchronized space.',
      color: 'bg-cream-200 text-cream-800 dark:bg-cozydark-800 dark:text-cream-200',
    },
    {
      icon: Sparkles,
      title: 'Daily Prompts & Bucket List',
      desc: 'Cozy questions to answer together every morning, plus joint adventures to check off.',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-cozydark-950 text-cream-900 dark:text-cream-100 transition-colors relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-blush-200/40 dark:bg-blush-900/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-lavender-200/40 dark:bg-lavender-900/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cream-300/30 dark:bg-cozydark-800/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blush-300 via-blush-200 to-lavender-200 dark:from-blush-900 dark:to-lavender-900 flex items-center justify-center shadow-sm">
            <span className="text-xl">🌸</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-cream-900 dark:text-cream-50 flex items-center gap-1.5">
              Sana &amp; Me
            </h1>
            <p className="text-[11px] text-cream-500 dark:text-cream-400 font-medium tracking-wide">
              A private two-person sanctuary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-cream-100 dark:bg-cozydark-900 border border-cream-200 dark:border-cozydark-800 text-cream-600 dark:text-cream-300 hover:bg-cream-200/70 dark:hover:bg-cozydark-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => openAuth('signin')}
            className="px-5 py-2.5 rounded-2xl bg-cream-100 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-800 dark:text-cream-200 text-sm font-medium hover:bg-cream-200/80 dark:hover:bg-cozydark-800 transition-all shadow-sm"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16 text-center flex-1 flex flex-col justify-center items-center">
        {/* Notice if Supabase is connected but schema not yet executed */}
        {!isMockMode && !isSchemaReady && (
          <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-sm animate-slide-up">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-left flex-1">
              <p className="font-semibold mb-1">
                Connected to Supabase! Initialize Database Tables
              </p>
              <p className="opacity-90 leading-relaxed">
                Your Supabase project (<code className="bg-amber-200/60 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[11px]">vxsushxqhqpjwayadqyj</code>) is connected. In your Supabase Dashboard, open <strong>SQL Editor</strong> and execute <code className="bg-amber-200/60 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[11px]">supabase/schema.sql</code> to create all tables and RLS security policies.
              </p>
            </div>
          </div>
        )}

        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blush-100/70 dark:bg-blush-950/60 border border-blush-200/80 dark:border-blush-800/80 text-blush-700 dark:text-blush-300 text-xs font-medium mb-6 animate-fade-in shadow-sm">
          <Heart className="w-3.5 h-3.5 fill-blush-400 text-blush-400 animate-pulse-subtle" />
          <span>Made with love for Sana and Azan</span>
        </div>

        {/* Main Headline */}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream-900 dark:text-cream-50 font-normal leading-[1.15] max-w-3xl mb-6 tracking-tight">
          Where our little moments, thoughts, and memories live.
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-cream-600 dark:text-cream-300 max-w-2xl font-light leading-relaxed mb-10">
          A soft, calm, and private haven designed just for the two of us. No noise, no algorithms, no distractions—just real conversations, favorite photos, and shared plans.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center max-w-lg mb-10">
          <button
            onClick={() => switchDemoUser('azan')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter as Azan ☕</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => switchDemoUser('sana')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-lavender-400 to-lavender-500 hover:from-lavender-500 hover:to-lavender-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter as Sana 🌸</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAuth('signin')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-cream-100/90 dark:bg-cozydark-850 border border-cream-300 dark:border-cozydark-800 text-cream-800 dark:text-cream-200 font-medium text-sm hover:bg-cream-200/80 dark:hover:bg-cozydark-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Enter Passcode 🔑</span>
          </button>
        </div>

        {/* Access Control Security Tag */}
        <div className="inline-flex items-center gap-2 text-xs text-cream-600 dark:text-cream-300 bg-cream-100/80 dark:bg-cozydark-900/80 px-4 py-2 rounded-full border border-cream-200 dark:border-cozydark-800 mb-14">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Passcode Protected • Azan (<code className="text-blush-600 dark:text-blush-300">azanisthebest</code>) &amp; Sana (<code className="text-lavender-600 dark:text-lavender-300">sanaisthebest</code>)</span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left w-full max-w-5xl">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-cream-100/70 dark:bg-cozydark-900/80 border border-cream-200/80 dark:border-cozydark-800/80 shadow-cozy dark:shadow-cozy-dark hover:border-blush-200 dark:hover:border-blush-900 transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${feat.color} flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-medium text-base text-cream-900 dark:text-cream-50 mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-cream-600 dark:text-cream-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-6 w-full text-center text-xs text-cream-500 dark:text-cream-400 border-t border-cream-200/60 dark:border-cozydark-850/60">
        <p>Built exclusively for Sana &amp; Azan • Powered by React, Vite, Tailwind CSS &amp; Supabase</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
