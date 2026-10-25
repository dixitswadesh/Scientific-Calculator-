import React from 'react';
import { X, Palette, Volume2, Vibrate, Check, Sliders } from 'lucide-react';
import { MATERIAL_THEMES, ThemeConfig } from '../utils/theme';
import { hapticEngine } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  onToggleVibration: (enabled: boolean) => void;
  isRadMode: boolean;
  onToggleRad: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  vibrationEnabled,
  onToggleVibration,
  isRadMode,
  onToggleRad,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div
        className="w-full sm:max-w-md max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Calculator Settings"
      >
        {/* Header */}
        <div className="pt-3 px-5 pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Settings & Customization
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('action');
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Material You Themes */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <span>Material You Color Theme</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(MATERIAL_THEMES).map((theme: ThemeConfig) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    hapticEngine.playKeyFeedback('action');
                    onSelectTheme(theme.id);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    currentThemeId === theme.id
                      ? 'border-sky-500 bg-slate-800/90 shadow-xs'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <span className="text-xs font-medium text-slate-200">
                      {theme.name}
                    </span>
                  </div>
                  {currentThemeId === theme.id && (
                    <Check className="w-4 h-4 text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Haptics and Audio Toggles */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Vibrate className="w-3.5 h-3.5 text-sky-400" />
              <span>Tactile & Feedback</span>
            </div>

            <div className="space-y-2">
              {/* Vibration Toggle */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Haptic Vibration</div>
                  <div className="text-[11px] text-slate-400">
                    Tactile motor feedback on key presses
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !vibrationEnabled;
                    hapticEngine.setVibrationEnabled(next);
                    onToggleVibration(next);
                    if (next) hapticEngine.playKeyFeedback('equals');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    vibrationEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      vibrationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Clicks Toggle */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Key Click Sounds</div>
                  <div className="text-[11px] text-slate-400">
                    Synthesized mechanical audio feedback
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    hapticEngine.setSoundEnabled(next);
                    onToggleSound(next);
                    if (next) hapticEngine.playKeyFeedback('equals');
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    soundEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Angle mode toggle */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Angle Unit</div>
                  <div className="text-[11px] text-slate-400">
                    Current trigonometry mode
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticEngine.playKeyFeedback('action');
                    onToggleRad();
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRadMode ? 'Radian (RAD)' : 'Degree (DEG)'}
                </button>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-xs font-semibold text-slate-300">
              Android Calculator Pro · v1.0.0
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Target SDK 35 · Material Design 3 · PWA & Google Play Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
