import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { hapticEngine } from '../utils/haptics';

type UnitCategory = 'length' | 'weight' | 'temp' | 'currency' | 'storage' | 'speed';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
  rate?: number; // Relative to base
}

const CATEGORIES: { id: UnitCategory; label: string }[] = [
  { id: 'length', label: 'Length' },
  { id: 'weight', label: 'Weight' },
  { id: 'temp', label: 'Temperature' },
  { id: 'currency', label: 'Currency' },
  { id: 'storage', label: 'Storage' },
  { id: 'speed', label: 'Speed' },
];

const UNIT_DATA: Record<UnitCategory, UnitDef[]> = {
  length: [
    { id: 'm', name: 'Meter', symbol: 'm', rate: 1 },
    { id: 'km', name: 'Kilometer', symbol: 'km', rate: 1000 },
    { id: 'cm', name: 'Centimeter', symbol: 'cm', rate: 0.01 },
    { id: 'mm', name: 'Millimeter', symbol: 'mm', rate: 0.001 },
    { id: 'in', name: 'Inch', symbol: 'in', rate: 0.0254 },
    { id: 'ft', name: 'Foot', symbol: 'ft', rate: 0.3048 },
    { id: 'yd', name: 'Yard', symbol: 'yd', rate: 0.9144 },
    { id: 'mi', name: 'Mile', symbol: 'mi', rate: 1609.344 },
  ],
  weight: [
    { id: 'kg', name: 'Kilogram', symbol: 'kg', rate: 1 },
    { id: 'g', name: 'Gram', symbol: 'g', rate: 0.001 },
    { id: 'mg', name: 'Milligram', symbol: 'mg', rate: 0.000001 },
    { id: 'lb', name: 'Pound', symbol: 'lb', rate: 0.45359237 },
    { id: 'oz', name: 'Ounce', symbol: 'oz', rate: 0.02834952 },
    { id: 'ton', name: 'Metric Ton', symbol: 't', rate: 1000 },
  ],
  temp: [
    {
      id: 'c',
      name: 'Celsius',
      symbol: '°C',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    {
      id: 'f',
      name: 'Fahrenheit',
      symbol: '°F',
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    {
      id: 'k',
      name: 'Kelvin',
      symbol: 'K',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  ],
  currency: [
    { id: 'usd', name: 'US Dollar', symbol: '$', rate: 1 },
    { id: 'eur', name: 'Euro', symbol: '€', rate: 1.08 },
    { id: 'gbp', name: 'British Pound', symbol: '£', rate: 1.28 },
    { id: 'inr', name: 'Indian Rupee', symbol: '₹', rate: 0.012 },
    { id: 'jpy', name: 'Japanese Yen', symbol: '¥', rate: 0.0067 },
    { id: 'cad', name: 'Canadian Dollar', symbol: 'CA$', rate: 0.74 },
    { id: 'aud', name: 'Australian Dollar', symbol: 'A$', rate: 0.65 },
    { id: 'cny', name: 'Chinese Yuan', symbol: 'CN¥', rate: 0.14 },
  ],
  storage: [
    { id: 'b', name: 'Byte', symbol: 'B', rate: 1 },
    { id: 'kb', name: 'Kilobyte', symbol: 'KB', rate: 1024 },
    { id: 'mb', name: 'Megabyte', symbol: 'MB', rate: 1024 * 1024 },
    { id: 'gb', name: 'Gigabyte', symbol: 'GB', rate: 1024 * 1024 * 1024 },
    { id: 'tb', name: 'Terabyte', symbol: 'TB', rate: 1024 * 1024 * 1024 * 1024 },
  ],
  speed: [
    { id: 'kmh', name: 'Kilometers / hour', symbol: 'km/h', rate: 1 },
    { id: 'mph', name: 'Miles / hour', symbol: 'mph', rate: 1.609344 },
    { id: 'ms', name: 'Meters / second', symbol: 'm/s', rate: 3.6 },
    { id: 'knot', name: 'Knot', symbol: 'kn', rate: 1.852 },
  ],
};

export const UnitConverter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');
  const [copied, setCopied] = useState<boolean>(false);

  const units = UNIT_DATA[activeCategory];

  // Update defaults when category switches
  const handleCategoryChange = (cat: UnitCategory) => {
    hapticEngine.playKeyFeedback('action');
    setActiveCategory(cat);
    const catUnits = UNIT_DATA[cat];
    setFromUnitId(catUnits[0].id);
    setToUnitId(catUnits[1]?.id || catUnits[0].id);
  };

  const handleSwap = () => {
    hapticEngine.playKeyFeedback('action');
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Convert calculation
  const convert = (): string => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '0';

    const fromDef = units.find((u) => u.id === fromUnitId);
    const toDef = units.find((u) => u.id === toUnitId);
    if (!fromDef || !toDef) return '0';

    if (activeCategory === 'temp') {
      const baseVal = fromDef.toBase ? fromDef.toBase(val) : val;
      const res = toDef.fromBase ? toDef.fromBase(baseVal) : baseVal;
      return Number(res.toFixed(6)).toString();
    } else {
      const fromRate = fromDef.rate || 1;
      const toRate = toDef.rate || 1;
      const inBase = val * fromRate;
      const res = inBase / toRate;
      return Number(res.toFixed(6)).toString();
    }
  };

  const result = convert();

  const handleCopy = async () => {
    hapticEngine.playKeyFeedback('action');
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 flex flex-col gap-5">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-sky-500 text-slate-950 shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Conversion Cards */}
      <div className="flex flex-col gap-3">
        {/* Input Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400">From</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-lg font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="0"
            />
            <select
              value={fromUnitId}
              onChange={(e) => {
                hapticEngine.playKeyFeedback('action');
                setFromUnitId(e.target.value);
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1 z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 shadow-md active:scale-95 transition-all cursor-pointer"
            title="Swap Units"
            aria-label="Swap Units"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Output Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">To</label>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3.5 py-2.5 text-xl font-bold font-mono text-sky-400 overflow-x-auto whitespace-nowrap">
              {result}
            </div>
            <select
              value={toUnitId}
              onChange={(e) => {
                hapticEngine.playKeyFeedback('action');
                setToUnitId(e.target.value);
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
