import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { Lock, Mail, User, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, resetPassword, isMockMode, isSchemaReady } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMockMode && !isSchemaReady) {
      showToast('Please run supabase/schema.sql in your Supabase SQL Editor first!', 'error');
      return;
    }
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          showToast(error.message || 'Failed to sign in. Please check your credentials.', 'error');
        } else {
          showToast('Welcome back! ✨', 'success');
          onClose();
        }
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          showToast('Please enter your display name.', 'error');
          setLoading(false);
          return;
        }
        const { error, needsApproval } = await signUp(email, password, displayName);
        if (error) {
          showToast(error.message || 'Failed to sign up.', 'error');
        } else {
          if (needsApproval) {
            showToast('Account created! Awaiting admin approval.', 'info');
          } else {
            showToast('Account created and verified! Welcome home 🌸', 'success');
          }
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          showToast(error.message || 'Failed to send reset link.', 'error');
        } else {
          showToast('Password reset email sent! Check your inbox 📬', 'success');
          setMode('signin');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blush-400" />
          <span>
            {mode === 'signin' && 'Sign in to our space'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {!isMockMode && !isSchemaReady && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            ⚠️ <strong>Database Setup Required:</strong> Please run <code className="bg-amber-200/60 dark:bg-amber-900 px-1 py-0.5 rounded text-[11px]">supabase/schema.sql</code> in your Supabase SQL Editor to initialize tables.
          </div>
        )}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="text"
                required
                placeholder="e.g. Sana or Azan"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300 dark:focus:ring-blush-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
            <input
              type="email"
              required
              placeholder="e.g. sana@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300 dark:focus:ring-blush-600"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-blush-500 hover:text-blush-600 dark:text-blush-300 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300 dark:focus:ring-blush-600"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Enter Sanctuary'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="pt-3 border-t border-cream-200/60 dark:border-cozydark-800 text-center text-xs text-cream-600 dark:text-cream-400">
          {mode === 'signin' && (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-blush-500 hover:text-blush-600 dark:text-blush-300"
              >
                Sign up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-blush-500 hover:text-blush-600 dark:text-blush-300"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-blush-500 hover:text-blush-600 dark:text-blush-300"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>

        {isMockMode && (
          <div className="p-3 rounded-2xl bg-cream-200/40 dark:bg-cozydark-850 border border-cream-200/60 dark:border-cozydark-800 text-xs text-cream-600 dark:text-cream-400 text-center">
            💡 <strong>Quick Demo:</strong> Enter any email with <code>sana</code> or <code>azan</code> to sign in instantly, or use any other email to preview the strict approval gatekeeper.
          </div>
        )}
      </form>
    </Modal>
  );
};
