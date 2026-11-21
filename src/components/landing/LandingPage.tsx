import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../common/Toast';
import {
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Heart,
  Radio,
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
      showToast('Enter your passcode to enter', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error, user } = await signInWithPasscode(passcode.trim());
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast(`Welcome, ${user?.display_name}! 🌸`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Incorrect passcode', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FAF6ED] dark:bg-[#0A090D] text-cream-900 dark:text-cream-100 transition-colors relative overflow-hidden flex flex-col justify-between selection:bg-blush-400 selection:text-white">
      {/* Directional Atmospheric Lighting */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blush-300/30 dark:from-blush-900/20 via-lavender-300/20 dark:via-lavender-900/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blush-200/20 dark:bg-blush-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 py-5 w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blush-400 to-blush-500 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif font-semibold text-base tracking-tight text-cream-950 dark:text-cream-50">
              Sana &amp; Azan
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-blush-600 dark:text-blush-400 opacity-80">
              Private
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-cream-200/60 dark:bg-cozydark-900/80 border border-cream-300/60 dark:border-cozydark-750 text-cream-700 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-cozydark-800 transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Focus: Gateway Centerpiece */}
      <main className="relative z-10 max-w-md mx-auto px-5 py-6 w-full flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Schema Setup Notice (if applicable) */}
        {!isSchemaReady && (
          <div className="w-full mb-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs text-left">
            <p className="font-semibold mb-1">⚠️ Setup Needed</p>
            <p className="text-[11px] opacity-90">
              Run <code className="bg-amber-200/60 dark:bg-amber-900 px-1 py-0.5 rounded">supabase/schema.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        )}

        {/* Minimal Signature Focal Artifact: Interconnected Two-Person Node */}
        <div className="mb-7 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-4">
            {/* Azan Node */}
            <div className="w-13 h-13 rounded-2xl bg-cream-100 dark:bg-cozydark-850 border border-cream-300 dark:border-cozydark-700 shadow-md flex items-center justify-center font-serif font-bold text-base text-cream-800 dark:text-cream-100 z-10">
              A
            </div>

            {/* Kinetic Connection Beam */}
            <div className="w-16 sm:w-20 h-0.5 bg-gradient-to-r from-cream-300 via-blush-400 to-cream-300 dark:from-cozydark-700 dark:via-blush-500 dark:to-cozydark-700 relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blush-500 shadow-[0_0_12px_rgba(232,99,143,0.8)] animate-pulse" />
            </div>

            {/* Sana Node */}
            <div className="w-13 h-13 rounded-2xl bg-cream-100 dark:bg-cozydark-850 border border-cream-300 dark:border-cozydark-700 shadow-md flex items-center justify-center font-serif font-bold text-base text-cream-800 dark:text-cream-100 z-10">
              S
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200/70 dark:bg-cozydark-850/90 border border-cream-300/60 dark:border-cozydark-750 text-[11px] text-cream-700 dark:text-cream-300">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Private 2-Person Live Channel</span>
          </div>
        </div>

        {/* Lock Card */}
        <div className="w-full p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-cozydark-900/80 border border-cream-200 dark:border-cozydark-750/80 shadow-cozy-lg dark:shadow-cozy-dark-lg backdrop-blur-xl">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-cream-950 dark:text-cream-50 mb-1">
            Unlock Channel
          </h2>
          <p className="text-xs text-cream-500 dark:text-cream-400 mb-5">
            Enter your secret passcode to step inside
          </p>

          <form onSubmit={handleUnlock} className="space-y-3.5">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400 dark:text-cozydark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Secret passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-300/70 dark:border-cozydark-700 text-cream-900 dark:text-cream-50 placeholder-cream-400 dark:placeholder-cozydark-500 text-sm focus:outline-none focus:ring-2 focus:ring-blush-400/60 tracking-wider"
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
              className="w-full py-3.5 px-5 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.99] text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Open Sanctuary</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-tap presets to make testing / logging in fast */}
          <div className="pt-4 mt-4 border-t border-cream-200/60 dark:border-cozydark-800 flex items-center justify-center gap-2">
            <span className="text-[11px] text-cream-400 dark:text-cream-500">Quick sign-in:</span>
            <button
              type="button"
              onClick={() => setPasscode('azanisthebest')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-cozydark-800 text-cream-700 dark:text-cream-300 hover:bg-blush-100 hover:text-blush-700 dark:hover:bg-cozydark-750 transition-colors"
            >
              Azan
            </button>
            <button
              type="button"
              onClick={() => setPasscode('sanaisthebest')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cream-100 dark:bg-cozydark-800 text-cream-700 dark:text-cream-300 hover:bg-blush-100 hover:text-blush-700 dark:hover:bg-cozydark-750 transition-colors"
            >
              Sana
            </button>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto px-6 py-5 w-full text-center text-[11px] text-cream-400 dark:text-cream-500">
        <p>Private &amp; synchronized exclusively for Sana &amp; Azan</p>
      </footer>
    </div>
  );
};
