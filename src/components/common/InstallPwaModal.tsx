import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Download, Share2, PlusSquare, Smartphone, CheckCircle, Sparkles } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blush-400" />
          <span>Add to Home Screen</span>
        </div>
      }
    >
      <div className="space-y-5 pt-1 text-cream-900 dark:text-cream-50">
        {/* App Icon & Badge */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-cream-100/70 dark:bg-cozydark-850 border border-cream-200/80 dark:border-cozydark-750">
          <div className="w-13 h-13 rounded-2xl overflow-hidden border border-cream-300 dark:border-cozydark-700 shadow-sm shrink-0">
            <img
              src="./icons/icon-192.png"
              alt="Sana & Me"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-sm sm:text-base leading-tight">
              Sana &amp; Me
            </h3>
            <p className="text-[11px] text-cream-500 dark:text-cream-400 font-light mt-0.5">
              Best Friends Sanctuary • Full-Screen Mobile App
            </p>
          </div>
        </div>

        {isStandalone || installSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1.5">
            <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto" />
            <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
              Sanctuary is Installed!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Open the app directly from your phone's Home Screen for the full-screen experience with no browser bars.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Step-by-Step Instructions */
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/70 dark:border-cozydark-750">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-600 dark:text-cream-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blush-400" />
                <span>iPhone / iPad Instructions (Safari)</span>
              </h4>

              <ol className="space-y-3 text-xs text-cream-800 dark:text-cream-200">
                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blush-100 dark:bg-blush-950/80 text-blush-600 dark:text-blush-300 font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <span>In Safari, tap the <strong>Share</strong> button</span>{' '}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cream-200/70 dark:bg-cozydark-750 font-mono text-[11px]">
                      <Share2 className="w-3 h-3 inline text-blush-500" /> Share
                    </span>{' '}
                    <span>at the bottom of your screen.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blush-100 dark:bg-blush-950/80 text-blush-600 dark:text-blush-300 font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <span>Scroll down and tap <strong>Add to Home Screen</strong></span>{' '}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cream-200/70 dark:bg-cozydark-750 font-mono text-[11px]">
                      <PlusSquare className="w-3 h-3 inline text-blush-500" /> Add to Home Screen
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blush-100 dark:bg-blush-950/80 text-blush-600 dark:text-blush-300 font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <span>Tap <strong>Add</strong> in the top-right corner. The 🌸 icon will appear on your Home Screen!</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        ) : deferredPrompt ? (
          /* Android / Chrome One-Tap Install */
          <div className="space-y-3 text-center">
            <p className="text-xs text-cream-600 dark:text-cream-400">
              Install the app on your home screen for quick one-tap access, full-screen view, and instant notifications.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blush-500 to-lavender-500 hover:from-blush-600 hover:to-lavender-600 text-white font-medium text-xs sm:text-sm shadow-cozy flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Install to Home Screen</span>
            </button>
          </div>
        ) : (
          /* Generic / Browser fallback instructions */
          <div className="p-3.5 rounded-2xl bg-cream-100/60 dark:bg-cozydark-850 border border-cream-200/70 dark:border-cozydark-750 text-xs space-y-2">
            <p className="text-cream-700 dark:text-cream-300">
              To install on your phone or desktop:
            </p>
            <ul className="list-disc list-inside space-y-1 text-cream-600 dark:text-cream-400 text-[11px]">
              <li><strong>Chrome / Android:</strong> Tap the 3 dots menu (⋮) and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
              <li><strong>Safari (iOS):</strong> Tap the <strong>Share</strong> button and choose <strong>"Add to Home Screen"</strong>.</li>
            </ul>
          </div>
        )}

        {/* Benefits list */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cream-200/60 dark:border-cozydark-800 text-center">
          <div className="p-2 rounded-xl bg-cream-100/40 dark:bg-cozydark-850/40">
            <span className="text-sm">⚡</span>
            <p className="text-[10px] font-medium text-cream-700 dark:text-cream-300 mt-0.5">Instant Launch</p>
          </div>
          <div className="p-2 rounded-xl bg-cream-100/40 dark:bg-cozydark-850/40">
            <span className="text-sm">📱</span>
            <p className="text-[10px] font-medium text-cream-700 dark:text-cream-300 mt-0.5">Full Screen</p>
          </div>
          <div className="p-2 rounded-xl bg-cream-100/40 dark:bg-cozydark-850/40">
            <span className="text-sm">🌸</span>
            <p className="text-[10px] font-medium text-cream-700 dark:text-cream-300 mt-0.5">Custom Icon</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cream-200/70 dark:bg-cozydark-800 text-cream-700 dark:text-cream-200 text-xs font-medium hover:bg-cream-300/70 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};
