import React from 'react';
import { History, Trash2, X, ArrowUpRight } from 'lucide-react';
import { HistoryItem, formatNumberWithCommas } from '../utils/calculator';
import { hapticEngine } from '../utils/haptics';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectResult: (val: string) => void;
  onSelectExpression: (expr: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onSelectExpression,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[75vh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-label="Calculation History"
      >
        {/* Drawer Header with Android Grab Handle */}
        <div className="pt-2 px-5 pb-3 border-b border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Calculation History
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    hapticEngine.playKeyFeedback('delete');
                    onClearHistory();
                  }}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
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
          </div>
        </div>

        {/* List of Calculation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <History className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No calculations yet</p>
              <p className="text-xs text-slate-600 mt-1">Calculations will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{formatTime(item.timestamp)}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        hapticEngine.playKeyFeedback('action');
                        onSelectExpression(item.expression);
                        onClose();
                      }}
                      className="text-sky-400 hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
                    >
                      Use Eq <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <div
                  onClick={() => {
                    hapticEngine.playKeyFeedback('action');
                    onSelectExpression(item.expression);
                    onClose();
                  }}
                  className="text-right text-xs md:text-sm text-slate-400 font-mono cursor-pointer hover:text-slate-200"
                >
                  {item.expression}
                </div>

                {/* Result */}
                <div
                  onClick={() => {
                    hapticEngine.playKeyFeedback('action');
                    onSelectResult(item.result);
                    onClose();
                  }}
                  className="text-right text-lg md:text-xl font-semibold text-white font-mono mt-0.5 cursor-pointer hover:text-sky-300"
                >
                  = {formatNumberWithCommas(item.result)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
