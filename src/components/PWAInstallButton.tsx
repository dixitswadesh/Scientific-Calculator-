import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { hapticEngine } from '../utils/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={async () => {
          hapticEngine.playKeyFeedback('action');
          await install();
        }}
        className="flex items-center gap-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 px-3 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
        title="Install to your phone"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            hapticEngine.playKeyFeedback('action');
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  Tap the <strong>Share</strong> button in Safari's bottom toolbar.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    3
                  </span>
                  Tap <strong>Add</strong> in the top right.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
