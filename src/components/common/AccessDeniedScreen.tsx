import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, ShieldAlert, LogOut, HeartHandshake } from 'lucide-react';

export const AccessDeniedScreen: React.FC = () => {
  const { user, signOut, switchDemoUser, isMockMode } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100 dark:bg-cozydark-950">
      <div className="max-w-md w-full bg-cream-50 dark:bg-cozydark-900 rounded-3xl p-8 border border-cream-200 dark:border-cozydark-800 shadow-cozy-lg text-center relative overflow-hidden animate-slide-up">
        {/* Soft Background Accents */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blush-200/40 dark:bg-blush-900/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-lavender-200/40 dark:bg-lavender-900/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-blush-100 dark:bg-blush-950/60 border border-blush-200 dark:border-blush-800 flex items-center justify-center mx-auto mb-5 shadow-sm text-blush-500">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-serif font-semibold text-cream-900 dark:text-cream-50 mb-2">
          Private Sanctuary
        </h2>
        <p className="text-sm text-cream-600 dark:text-cream-300 leading-relaxed mb-6">
          This is an invite-only space exclusively reserved for <strong>Sana</strong> and{' '}
          <strong>Azan</strong>. Your account (
          <code className="text-xs bg-cream-200/60 dark:bg-cozydark-800 px-1.5 py-0.5 rounded text-blush-600 dark:text-blush-300">
            {user?.email || 'Unknown'}
          </code>
          ) is authenticated, but has not been whitelisted as one of the two approved members.
        </p>

        <div className="p-4 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/70 dark:border-cozydark-800 text-left mb-6 text-xs text-cream-600 dark:text-cream-400 space-y-2">
          <div className="flex items-center gap-2 font-medium text-cream-800 dark:text-cream-200">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Database Row Level Security Active</span>
          </div>
          <p>
            PostgreSQL policies strictly prevent reading, inserting, or modifying messages, memories, and notes for non-approved accounts.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cream-200/80 dark:bg-cozydark-800 hover:bg-cream-300/80 dark:hover:bg-cozydark-750 text-cream-800 dark:text-cream-200 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          {isMockMode && (
            <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-800">
              <p className="text-[11px] text-cream-500 dark:text-cream-400 mb-2">
                Testing Demo Mode? Switch back to an approved account:
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => switchDemoUser('azan')}
                  className="px-3 py-1.5 rounded-xl bg-blush-100 text-blush-700 dark:bg-blush-950/60 dark:text-blush-300 text-xs font-medium hover:bg-blush-200 transition-colors"
                >
                  Switch to Azan
                </button>
                <button
                  onClick={() => switchDemoUser('sana')}
                  className="px-3 py-1.5 rounded-xl bg-lavender-100 text-lavender-700 dark:bg-lavender-950/60 dark:text-lavender-300 text-xs font-medium hover:bg-lavender-200 transition-colors"
                >
                  Switch to Sana
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
