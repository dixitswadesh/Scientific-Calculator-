import React, { useState } from 'react';
import { Copy, Check, Delete } from 'lucide-react';
import { formatNumberWithCommas } from '../utils/calculator';
import { hapticEngine } from '../utils/haptics';

interface CalculatorDisplayProps {
  expression: string;
  displayValue: string;
  previewResult: string | null;
  isRadMode: boolean;
  onToggleRad: () => void;
  onBackspace: () => void;
  hasMemory: boolean;
  textColor?: string;
  hasEvaluated: boolean;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  displayValue,
  previewResult,
  isRadMode,
  onToggleRad,
  onBackspace,
  hasMemory,
  textColor = 'text-white',
  hasEvaluated,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    hapticEngine.playKeyFeedback('action');
    const textToCopy = displayValue || expression || '0';
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback
    }
  };

  // Compute responsive dynamic text size based on character count
  const getDisplaySizeClass = (str: string) => {
    const len = str.length;
    if (len > 18) return 'text-2xl md:text-3xl tracking-tight';
    if (len > 14) return 'text-3xl md:text-4xl tracking-tight';
    if (len > 10) return 'text-4xl md:text-5xl';
    return 'text-5xl md:text-6xl font-light';
  };

  const formattedDisplay = formatNumberWithCommas(displayValue);

  return (
    <div className="w-full flex flex-col justify-end px-5 py-4 min-h-[170px] select-text">
      {/* Top Indicators Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 select-none">
        <div className="flex items-center gap-2">
          {/* Degree / Radian Toggle Chip */}
          <button
            type="button"
            onClick={onToggleRad}
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
            title="Click to toggle Degree / Radian mode"
          >
            {isRadMode ? 'RAD' : 'DEG'}
          </button>

          {hasMemory && (
            <span className="text-[11px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800/40 px-1.5 py-0.5 rounded">
              M
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 active:scale-95 transition-all flex items-center gap-1 text-[11px] cursor-pointer"
            title="Copy value"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('delete');
              onBackspace();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expression Tape View */}
      <div className="w-full text-right overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none py-1 min-h-[28px]">
        <span className="text-base md:text-lg text-slate-400 font-normal tracking-wide font-mono tabular-nums">
          {expression || ' '}
        </span>
      </div>

      {/* Main Number Display & Live Preview */}
      <div className="w-full text-right overflow-hidden mt-1 flex flex-col items-end justify-center">
        <div
          className={`w-full text-right overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none transition-all duration-150 ${getDisplaySizeClass(
            formattedDisplay
          )} ${textColor} font-sans tabular-nums`}
        >
          {formattedDisplay || '0'}
        </div>

        {/* Live Preview of result if user is currently typing equation without having pressed equals */}
        {!hasEvaluated && previewResult && previewResult !== displayValue && (
          <div className="text-sm md:text-base text-slate-400 font-mono tracking-tight mt-0.5 animate-fadeIn">
            = {formatNumberWithCommas(previewResult)}
          </div>
        )}
      </div>
    </div>
  );
};
