import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { KeyRound, ArrowRight, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithPasscode } = useAuth();
  const { showToast } = useToast();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        showToast(`Welcome back, ${user?.display_name}! 🌸✨`, 'success');
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Incorrect passcode', 'error');
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
          <span>Sanctuary Entrance</span>
        </div>
      }
    >
      <div className="space-y-5 pt-1">
        <p className="text-xs text-cream-600 dark:text-cream-300 leading-relaxed text-center font-light">
          Enter your secret passcode to step inside our private space.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-1.5">
              Secret Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-cream-100/80 dark:bg-cozydark-850 border border-cream-300/80 dark:border-cozydark-800 text-cream-900 dark:text-cream-50 placeholder-cream-400 text-sm focus:outline-none focus:ring-2 focus:ring-blush-300 dark:focus:ring-blush-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white font-medium text-sm shadow-cozy hover:shadow-cozy-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Unlock Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-2xl bg-cream-100/50 dark:bg-cozydark-850 border border-cream-200/60 dark:border-cozydark-800 text-center">
          <p className="text-[11px] text-cream-500 dark:text-cream-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Passcode session stays securely remembered on your device</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};
