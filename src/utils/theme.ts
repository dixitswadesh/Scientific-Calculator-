export interface ThemeConfig {
  id: string;
  name: string;
  accent: string;
  bgApp: string;
  bgCard: string;
  bgKeyNumber: string;
  bgKeyOperator: string;
  bgKeyAction: string;
  bgKeyEquals: string;
  textDisplay: string;
  textKeyNumber: string;
  textKeyOperator: string;
  textKeyEquals: string;
  textKeyAction: string;
  isDark: boolean;
}

export const MATERIAL_THEMES: Record<string, ThemeConfig> = {
  ocean: {
    id: 'ocean',
    name: 'Pixel Ocean',
    accent: '#38bdf8',
    bgApp: 'bg-slate-950',
    bgCard: 'bg-slate-900',
    bgKeyNumber: 'bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600',
    bgKeyOperator: 'bg-sky-950/70 hover:bg-sky-900/80 active:bg-sky-800/90 text-sky-400',
    bgKeyAction: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300',
    bgKeyEquals: 'bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950',
    textDisplay: 'text-white',
    textKeyNumber: 'text-slate-100',
    textKeyOperator: 'text-sky-300',
    textKeyEquals: 'text-slate-950',
    textKeyAction: 'text-slate-300',
    isDark: true,
  },
  coral: {
    id: 'coral',
    name: 'Coral Sunset',
    accent: '#fb7185',
    bgApp: 'bg-stone-950',
    bgCard: 'bg-stone-900',
    bgKeyNumber: 'bg-stone-800/80 hover:bg-stone-700 active:bg-stone-600',
    bgKeyOperator: 'bg-rose-950/70 hover:bg-rose-900/80 active:bg-rose-800 text-rose-300',
    bgKeyAction: 'bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-300',
    bgKeyEquals: 'bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white',
    textDisplay: 'text-white',
    textKeyNumber: 'text-stone-100',
    textKeyOperator: 'text-rose-300',
    textKeyEquals: 'text-white',
    textKeyAction: 'text-stone-300',
    isDark: true,
  },
  sage: {
    id: 'sage',
    name: 'Botanical Sage',
    accent: '#4ade80',
    bgApp: 'bg-zinc-950',
    bgCard: 'bg-zinc-900',
    bgKeyNumber: 'bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600',
    bgKeyOperator: 'bg-emerald-950/70 hover:bg-emerald-900/80 active:bg-emerald-800 text-emerald-300',
    bgKeyAction: 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300',
    bgKeyEquals: 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950',
    textDisplay: 'text-white',
    textKeyNumber: 'text-zinc-100',
    textKeyOperator: 'text-emerald-300',
    textKeyEquals: 'text-zinc-950',
    textKeyAction: 'text-zinc-300',
    isDark: true,
  },
  amoled: {
    id: 'amoled',
    name: 'AMOLED Black',
    accent: '#60a5fa',
    bgApp: 'bg-black',
    bgCard: 'bg-neutral-950',
    bgKeyNumber: 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700',
    bgKeyOperator: 'bg-neutral-800/90 hover:bg-neutral-700 active:bg-neutral-600 text-blue-400',
    bgKeyAction: 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-400',
    bgKeyEquals: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white',
    textDisplay: 'text-white',
    textKeyNumber: 'text-white',
    textKeyOperator: 'text-blue-400',
    textKeyEquals: 'text-white',
    textKeyAction: 'text-neutral-300',
    isDark: true,
  },
  violet: {
    id: 'violet',
    name: 'Cyber Violet',
    accent: '#c084fc',
    bgApp: 'bg-slate-950',
    bgCard: 'bg-purple-950/30',
    bgKeyNumber: 'bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700',
    bgKeyOperator: 'bg-purple-950/70 hover:bg-purple-900 active:bg-purple-800 text-purple-300',
    bgKeyAction: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-purple-200',
    bgKeyEquals: 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white',
    textDisplay: 'text-white',
    textKeyNumber: 'text-slate-100',
    textKeyOperator: 'text-purple-300',
    textKeyEquals: 'text-white',
    textKeyAction: 'text-purple-200',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Material Light',
    accent: '#2563eb',
    bgApp: 'bg-slate-100',
    bgCard: 'bg-white',
    bgKeyNumber: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800',
    bgKeyOperator: 'bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700',
    bgKeyAction: 'bg-slate-200/70 hover:bg-slate-200 active:bg-slate-300 text-slate-700',
    bgKeyEquals: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
    textDisplay: 'text-slate-900',
    textKeyNumber: 'text-slate-800',
    textKeyOperator: 'text-blue-700',
    textKeyEquals: 'text-white',
    textKeyAction: 'text-slate-700',
    isDark: false,
  },
};
