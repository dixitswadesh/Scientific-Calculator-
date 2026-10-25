import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  History,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Smartphone,
  Layers,
  Calculator as CalcIcon,
  Sparkles
} from 'lucide-react';
import { KeypadButton } from './components/KeypadButton';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UnitConverter } from './components/UnitConverter';
import { PlayStoreHub } from './components/PlayStoreHub';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { evaluateExpression, HistoryItem } from './utils/calculator';
import { MATERIAL_THEMES, ThemeConfig } from './utils/theme';
import { hapticEngine } from './utils/haptics';

export default function App() {
  // Navigation View: 'calculator' | 'converter' | 'playstore'
  const [activeView, setActiveView] = useState<'calculator' | 'converter' | 'playstore'>('calculator');

  // Scientific keypad expansion state
  const [isScientificExpanded, setIsScientificExpanded] = useState<boolean>(false);

  // Theme & Preferences State
  const [currentThemeId, setCurrentThemeId] = useState<string>('ocean');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [isRadMode, setIsRadMode] = useState<boolean>(false);

  // Calculator State
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calc_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedTheme = localStorage.getItem('calc_theme');
      if (savedTheme && MATERIAL_THEMES[savedTheme]) setCurrentThemeId(savedTheme);

      const savedRad = localStorage.getItem('calc_is_rad');
      if (savedRad !== null) setIsRadMode(savedRad === 'true');

      setSoundEnabled(hapticEngine.getSoundEnabled());
      setVibrationEnabled(hapticEngine.getVibrationEnabled());
    } catch {
      // LocalStorage error resilience
    }
  }, []);

  const theme: ThemeConfig = MATERIAL_THEMES[currentThemeId] || MATERIAL_THEMES.ocean;

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem('calc_history', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Live calculation preview
  const previewResult = useMemo(() => {
    if (!expression || hasEvaluated) return null;
    // Don't preview if ends with operator
    if (/[+\-×÷^(\s]$/.test(expression)) return null;
    const res = evaluateExpression(expression, isRadMode);
    if (res.success && res.result !== expression && res.result !== 'Error') {
      return res.result;
    }
    return null;
  }, [expression, hasEvaluated, isRadMode]);

  // Handle number input
  const handleNumberInput = useCallback(
    (num: string) => {
      if (hasEvaluated) {
        setExpression(num);
        setDisplayValue(num);
        setHasEvaluated(false);
      } else {
        const nextExpr = expression === '0' && num !== '.' ? num : expression + num;
        setExpression(nextExpr);

        // Update display with current number segment
        if (displayValue === '0' && num !== '.') {
          setDisplayValue(num);
        } else {
          setDisplayValue(displayValue + num);
        }
      }
    },
    [expression, displayValue, hasEvaluated]
  );

  // Handle decimal dot
  const handleDot = useCallback(() => {
    if (hasEvaluated) {
      setExpression('0.');
      setDisplayValue('0.');
      setHasEvaluated(false);
      return;
    }
    // Prevent multiple dots in same number segment
    const segments = expression.split(/[\s+\-×÷()^]+/);
    const lastSegment = segments[segments.length - 1] || '';
    if (!lastSegment.includes('.')) {
      const nextExpr = expression === '' || /[+\-×÷^(\s]$/.test(expression) ? expression + '0.' : expression + '.';
      setExpression(nextExpr);
      setDisplayValue(displayValue.includes('.') ? displayValue : displayValue + '.');
    }
  }, [expression, displayValue, hasEvaluated]);

  // Handle operators (+, -, ×, ÷, %, ^)
  const handleOperator = useCallback(
    (op: string) => {
      let base = expression;
      if (hasEvaluated) {
        base = displayValue;
        setHasEvaluated(false);
      }

      if (!base) {
        if (op === '−') {
          setExpression('−');
          setDisplayValue('−');
        }
        return;
      }

      // If last char is already an operator, replace it
      if (/[+\-×÷^]$/.test(base)) {
        setExpression(base.slice(0, -1) + op);
      } else {
        setExpression(base + op);
      }
      setDisplayValue('0');
    },
    [expression, displayValue, hasEvaluated]
  );

  // Handle Clear
  const handleClear = useCallback(() => {
    setExpression('');
    setDisplayValue('0');
    setHasEvaluated(false);
  }, []);

  // Handle Backspace
  const handleBackspace = useCallback(() => {
    if (hasEvaluated) {
      handleClear();
      return;
    }
    if (expression.length > 0) {
      const nextExpr = expression.slice(0, -1);
      setExpression(nextExpr);
      if (displayValue.length > 1) {
        setDisplayValue(displayValue.slice(0, -1));
      } else {
        setDisplayValue('0');
      }
    }
  }, [expression, displayValue, hasEvaluated, handleClear]);

  // Handle Equals (=)
  const handleEquals = useCallback(() => {
    if (!expression) return;
    const res = evaluateExpression(expression, isRadMode);
    if (res.success) {
      setDisplayValue(res.result);
      setHasEvaluated(true);

      // Record in History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression,
        result: res.result,
        timestamp: Date.now(),
      };
      saveHistory([newItem, ...history.slice(0, 49)]);
    } else {
      setDisplayValue(res.result);
      setHasEvaluated(true);
    }
  }, [expression, isRadMode, history]);

  // Handle scientific functions (sin, cos, tan, log, etc.)
  const handleScientificFunction = useCallback(
    (fnName: string) => {
      let base = expression;
      if (hasEvaluated) {
        base = '';
        setHasEvaluated(false);
      }

      if (fnName === 'pi') {
        setExpression(base + 'π');
        setDisplayValue('π');
      } else if (fnName === 'e') {
        setExpression(base + 'e');
        setDisplayValue('e');
      } else if (fnName === 'square') {
        setExpression(base + '^2');
      } else if (fnName === 'cube') {
        setExpression(base + '^3');
      } else if (fnName === 'sqrt') {
        setExpression(base + 'sqrt(');
        setDisplayValue('0');
      } else if (fnName === 'cbrt') {
        setExpression(base + 'cbrt(');
        setDisplayValue('0');
      } else if (fnName === 'fact') {
        setExpression(base + '!');
      } else if (fnName === 'inv') {
        setExpression(`(1/${base || displayValue})`);
      } else {
        // Trigs & Logs: sin(, cos(, tan(, ln(, log(
        setExpression(base + fnName + '(');
        setDisplayValue('0');
      }
    },
    [expression, displayValue, hasEvaluated]
  );

  // Handle memory operations
  const handleMemory = useCallback(
    (action: 'mc' | 'mr' | 'm+' | 'm-') => {
      const currentNum = parseFloat(displayValue) || 0;
      if (action === 'mc') {
        setMemory(0);
      } else if (action === 'mr') {
        handleNumberInput(String(memory));
      } else if (action === 'm+') {
        setMemory((prev) => prev + currentNum);
      } else if (action === 'm-') {
        setMemory((prev) => prev - currentNum);
      }
    },
    [displayValue, memory, handleNumberInput]
  );

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeView !== 'calculator') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        hapticEngine.playKeyFeedback('number');
        handleNumberInput(key);
      } else if (key === '.') {
        hapticEngine.playKeyFeedback('number');
        handleDot();
      } else if (key === '+') {
        hapticEngine.playKeyFeedback('operator');
        handleOperator('+');
      } else if (key === '-') {
        hapticEngine.playKeyFeedback('operator');
        handleOperator('−');
      } else if (key === '*' || key === 'x' || key === 'X') {
        hapticEngine.playKeyFeedback('operator');
        handleOperator('×');
      } else if (key === '/') {
        hapticEngine.playKeyFeedback('operator');
        handleOperator('÷');
      } else if (key === '%') {
        hapticEngine.playKeyFeedback('operator');
        handleOperator('%');
      } else if (key === '(' || key === ')') {
        hapticEngine.playKeyFeedback('operator');
        setExpression((prev) => prev + key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        hapticEngine.playKeyFeedback('equals');
        handleEquals();
      } else if (key === 'Backspace') {
        hapticEngine.playKeyFeedback('delete');
        handleBackspace();
      } else if (key === 'Escape') {
        hapticEngine.playKeyFeedback('action');
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, handleNumberInput, handleDot, handleOperator, handleEquals, handleBackspace, handleClear]);

  return (
    <div className={`min-h-screen ${theme.bgApp} text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white transition-colors duration-200`}>
      {/* Top Bar Navigation (Clean 3-zone contract) */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 pt-safe flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <CalcIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
            Calculator Pro
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('action');
              setActiveView('calculator');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'calculator'
                ? 'bg-slate-800 text-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calculator
          </button>

          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('action');
              setActiveView('converter');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'converter'
                ? 'bg-slate-800 text-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unit Converter
          </button>

          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('action');
              setActiveView('playstore');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeView === 'playstore'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Play Store & Install</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Install Button + History + Settings) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton />

          {activeView === 'calculator' && (
            <button
              type="button"
              onClick={() => {
                hapticEngine.playKeyFeedback('action');
                setIsHistoryOpen(true);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Calculation History"
              aria-label="History"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              hapticEngine.playKeyFeedback('action');
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Settings & Themes"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto pb-safe">
        {/* VIEW 1: CALCULATOR */}
        {activeView === 'calculator' && (
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
            {/* Main Phone Calculator Canvas */}
            <div
              className={`w-full max-w-sm sm:max-w-md ${theme.bgCard} rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col`}
            >
              {/* Display Screen */}
              <CalculatorDisplay
                expression={expression}
                displayValue={displayValue}
                previewResult={previewResult}
                isRadMode={isRadMode}
                onToggleRad={() => {
                  const next = !isRadMode;
                  setIsRadMode(next);
                  localStorage.setItem('calc_is_rad', String(next));
                }}
                onBackspace={handleBackspace}
                hasMemory={memory !== 0}
                textColor={theme.textDisplay}
                hasEvaluated={hasEvaluated}
              />

              {/* Memory Strip */}
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-b border-slate-800/60 bg-slate-950/30 text-xs">
                {(['mc', 'mr', 'm+', 'm-'] as const).map((mOp) => (
                  <button
                    key={mOp}
                    type="button"
                    onClick={() => {
                      hapticEngine.playKeyFeedback('action');
                      handleMemory(mOp);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-sky-300 active:scale-95 transition-all uppercase cursor-pointer"
                  >
                    {mOp}
                  </button>
                ))}

                {/* Scientific Drawer Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    hapticEngine.playKeyFeedback('action');
                    setIsScientificExpanded(!isScientificExpanded);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 py-1 px-2 rounded-lg bg-sky-950/40 border border-sky-800/40 cursor-pointer"
                >
                  <span>{isScientificExpanded ? 'Standard' : 'Scientific'}</span>
                  {isScientificExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Scientific Extension Keypad (Collapsible) */}
              {isScientificExpanded && (
                <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-5 gap-1.5 animate-fadeIn">
                  <KeypadButton label="sin" value="sin" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-sky-300" />
                  <KeypadButton label="cos" value="cos" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-sky-300" />
                  <KeypadButton label="tan" value="tan" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-sky-300" />
                  <KeypadButton label="ln" value="ln" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-sky-300" />
                  <KeypadButton label="log" value="log" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-sky-300" />

                  <KeypadButton label="sin⁻¹" value="asin" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="cos⁻¹" value="acos" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="tan⁻¹" value="atan" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="√" value="sqrt" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="x²" value="square" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />

                  <KeypadButton label="π" value="pi" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-amber-300 font-serif" />
                  <KeypadButton label="e" value="e" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-amber-300 font-serif" />
                  <KeypadButton label="x^y" value="^" onClick={(v) => handleOperator(v)} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="n!" value="fact" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                  <KeypadButton label="1/x" value="inv" onClick={handleScientificFunction} type="scientific" className="h-10 rounded-xl bg-slate-800/60 text-xs text-slate-300" />
                </div>
              )}

              {/* Standard Android Keypad Grid (4 columns) */}
              <div className="p-3.5 sm:p-4 grid grid-cols-4 gap-2 sm:gap-2.5">
                {/* Row 1 */}
                <KeypadButton
                  label="AC"
                  value="AC"
                  onClick={handleClear}
                  type="action"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-bold ${theme.bgKeyAction} ${theme.textKeyAction}`}
                />
                <KeypadButton
                  label="( )"
                  value="paren"
                  onClick={() => {
                    // Smart parens: open if empty or after operator, close if unmatched open paren exists
                    const openCount = (expression.match(/\(/g) || []).length;
                    const closeCount = (expression.match(/\)/g) || []).length;
                    if (openCount > closeCount && /[0-9πe!]$/.test(expression)) {
                      setExpression((prev) => prev + ')');
                    } else {
                      setExpression((prev) => (prev === '0' ? '(' : prev + '('));
                    }
                  }}
                  type="action"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-semibold ${theme.bgKeyAction} ${theme.textKeyAction}`}
                />
                <KeypadButton
                  label="%"
                  value="%"
                  onClick={handleOperator}
                  type="action"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-semibold ${theme.bgKeyAction} ${theme.textKeyAction}`}
                />
                <KeypadButton
                  label="÷"
                  value="÷"
                  onClick={handleOperator}
                  type="operator"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-semibold ${theme.bgKeyOperator} ${theme.textKeyOperator}`}
                />

                {/* Row 2 */}
                <KeypadButton
                  label="7"
                  value="7"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="8"
                  value="8"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="9"
                  value="9"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="×"
                  value="×"
                  onClick={handleOperator}
                  type="operator"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-semibold ${theme.bgKeyOperator} ${theme.textKeyOperator}`}
                />

                {/* Row 3 */}
                <KeypadButton
                  label="4"
                  value="4"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="5"
                  value="5"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="6"
                  value="6"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="−"
                  value="−"
                  onClick={handleOperator}
                  type="operator"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-semibold ${theme.bgKeyOperator} ${theme.textKeyOperator}`}
                />

                {/* Row 4 */}
                <KeypadButton
                  label="1"
                  value="1"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="2"
                  value="2"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="3"
                  value="3"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="+"
                  value="+"
                  onClick={handleOperator}
                  type="operator"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-semibold ${theme.bgKeyOperator} ${theme.textKeyOperator}`}
                />

                {/* Row 5 */}
                <KeypadButton
                  label="0"
                  value="0"
                  onClick={handleNumberInput}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="."
                  value="."
                  onClick={handleDot}
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-xl sm:text-2xl font-medium ${theme.bgKeyNumber} ${theme.textKeyNumber}`}
                />
                <KeypadButton
                  label="⌫"
                  value="backspace"
                  onClick={handleBackspace}
                  type="delete"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-medium ${theme.bgKeyAction} text-slate-300`}
                />
                <KeypadButton
                  label="="
                  value="="
                  onClick={handleEquals}
                  type="equals"
                  className={`h-14 sm:h-16 rounded-2xl sm:rounded-3xl text-2xl font-bold ${theme.bgKeyEquals} ${theme.textKeyEquals}`}
                />
              </div>
            </div>

            {/* Desktop Side Tape Panel (Shown on lg: viewports) */}
            <div className="hidden lg:flex flex-col w-80 p-5 rounded-3xl bg-slate-900 border border-slate-800 h-[580px] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-semibold text-white">Calculation Tape</span>
                </div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => saveHistory([])}
                    className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pt-3 space-y-3">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                    <p>Recent calculations will appear here for fast re-use.</p>
                  </div>
                ) : (
                  history.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 transition-colors cursor-pointer group"
                      onClick={() => {
                        hapticEngine.playKeyFeedback('action');
                        setDisplayValue(item.result);
                        setExpression(item.expression);
                        setHasEvaluated(true);
                      }}
                    >
                      <div className="text-right text-xs text-slate-400 font-mono">
                        {item.expression}
                      </div>
                      <div className="text-right text-base font-bold text-white font-mono group-hover:text-sky-300">
                        = {item.result}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: UNIT CONVERTER */}
        {activeView === 'converter' && <UnitConverter />}

        {/* VIEW 3: PLAY STORE HUB */}
        {activeView === 'playstore' && <PlayStoreHub />}
      </main>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* History Slide-Up Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(val) => {
          setDisplayValue(val);
          setHasEvaluated(true);
        }}
        onSelectExpression={(expr) => {
          setExpression(expr);
          setHasEvaluated(false);
        }}
        onClearHistory={() => saveHistory([])}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={(id) => {
          setCurrentThemeId(id);
          localStorage.setItem('calc_theme', id);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={(enabled) => setSoundEnabled(enabled)}
        vibrationEnabled={vibrationEnabled}
        onToggleVibration={(enabled) => setVibrationEnabled(enabled)}
        isRadMode={isRadMode}
        onToggleRad={() => {
          const next = !isRadMode;
          setIsRadMode(next);
          localStorage.setItem('calc_is_rad', String(next));
        }}
      />
    </div>
  );
}
