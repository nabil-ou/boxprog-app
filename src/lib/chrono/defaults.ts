import type { LucideIcon } from 'lucide-react-native';
import { BarChart3, Copy, Flag, Infinity, RefreshCw, Timer } from 'lucide-react-native';

import type { ChronoConfig, ChronoMode, HomeFormat, MixBlock } from '@/lib/chrono/types';

export const DEFAULT_CONFIG: ChronoConfig = {
  mode: 'mix',
  amrap: 12,
  cap: 15,
  iv: 60,
  rounds: 10,
  tw: 20,
  tr: 10,
  tn: 8,
  iw: 40,
  ir: 20,
  in: 8,
  down: 300,
  cd: 10,
  voice: true,
  vib: true,
  favs: [],
  mix: [],
};

export type FieldDef = {
  k: keyof ChronoConfig;
  l: string;
  u?: string;
  min: number;
  max: number;
  step?: number;
  /** interval display */
  f?: boolean;
  /** mm:ss display */
  t?: boolean;
  zero?: string;
};

export const DEFS: Record<Exclude<ChronoMode, 'mix'>, FieldDef[]> = {
  amrap: [{ k: 'amrap', l: 'Durée', u: 'min', min: 1, max: 90, step: 1 }],
  fort: [{ k: 'cap', l: 'Time cap', u: 'min', min: 0, max: 90, step: 1, zero: 'Aucun' }],
  emom: [
    { k: 'iv', l: 'Toutes les', f: true, min: 10, max: 600 },
    { k: 'rounds', l: 'Rounds', min: 1, max: 99, step: 1 },
  ],
  tabata: [
    { k: 'tw', l: 'Travail', t: true, min: 5, max: 600 },
    { k: 'tr', l: 'Repos', t: true, min: 0, max: 600 },
    { k: 'tn', l: 'Rounds', min: 1, max: 99, step: 1 },
  ],
  int: [
    { k: 'iw', l: 'Travail', t: true, min: 5, max: 600 },
    { k: 'ir', l: 'Repos', t: true, min: 0, max: 600 },
    { k: 'in', l: 'Rounds', min: 1, max: 99, step: 1 },
  ],
  up: [],
  down: [{ k: 'down', l: 'Durée', t: true, min: 5, max: 5400 }],
};

export const MIX_BLOCK_META: Record<
  MixBlock['m'],
  { n: string; min: number; max: number; v: number; fixed?: boolean }
> = {
  amrap: { n: 'AMRAP', min: 1, max: 60, v: 12 },
  fort: { n: 'For Time', min: 0, max: 60, v: 15 },
  emom: { n: 'EMOM', min: 1, max: 99, v: 10 },
  tabata: { n: 'Tabata', min: 1, max: 99, v: 8 },
  int: { n: 'Intervalles', min: 1, max: 99, v: 8 },
  up: { n: 'Libre', min: 0, max: 0, v: 0, fixed: true },
  rest: { n: 'Repos', min: 5, max: 600, v: 60 },
};

export const HOME_FORMATS: {
  id: HomeFormat;
  title: string;
  desc: string;
  Icon: LucideIcon;
}[] = [
  { id: 'amrap', title: 'AMRAP', desc: 'Un max de tours', Icon: RefreshCw },
  { id: 'fort', title: 'For Time', desc: 'Contre la montre', Icon: Flag },
  { id: 'emom', title: 'EMOM', desc: 'À chaque minute', Icon: Timer },
  { id: 'tabata', title: 'Tabata', desc: '20 s / 10 s • 8 tours', Icon: BarChart3 },
  { id: 'int', title: 'Intervalles', desc: 'Effort / repos', Icon: Copy },
  { id: 'up', title: 'Libre', desc: 'Sans limite', Icon: Infinity },
];

export function presetBlock(format: HomeFormat): MixBlock {
  switch (format) {
    case 'amrap':
      return { m: 'amrap', v: 12 };
    case 'fort':
      return { m: 'fort', v: 15 };
    case 'emom':
      return { m: 'emom', v: 10, iv: 60 };
    case 'tabata':
      return { m: 'tabata', v: 8, iv: 20, rs: 10 };
    case 'int':
      return { m: 'int', v: 8, iv: 40, rs: 20 };
    case 'up':
      return { m: 'up', v: 0 };
  }
}

export type OtherFormatId = 'e2mom' | 'deathby' | 'chipper';

/** Secondary format chips under the main grid (maquette « Autres formats »). */
export const OTHER_FORMATS: {
  id: OtherFormatId;
  title: string;
  mix: MixBlock[];
}[] = [
  { id: 'e2mom', title: 'E2MOM', mix: [{ m: 'emom', v: 10, iv: 120 }] },
  { id: 'deathby', title: 'Death by', mix: [{ m: 'emom', v: 20, iv: 60 }] },
  { id: 'chipper', title: 'Chipper', mix: [{ m: 'fort', v: 20 }] },
];

export function workRestRounds(cfg: ChronoConfig): [number, number, number] {
  return cfg.mode === 'tabata' ? [cfg.tw, cfg.tr, cfg.tn] : [cfg.iw, cfg.ir, cfg.in];
}

/** Total session length in ms (0 = open-ended). Last rest of tabata/int skipped. */
export function totalMs(cfg: ChronoConfig): number {
  const m = cfg.mode;
  if (m === 'amrap') return cfg.amrap * 60000;
  if (m === 'fort') return cfg.cap ? cfg.cap * 60000 : 0;
  if (m === 'up') return 0;
  if (m === 'down') return cfg.down * 1000;
  if (m === 'int' || m === 'tabata') {
    const [w, rs, n] = workRestRounds(cfg);
    return ((w + rs) * n - rs) * 1000;
  }
  if (m === 'emom') return cfg.iv * cfg.rounds * 1000;
  return 0;
}

export function mixBlockSeconds(b: MixBlock): number {
  if (b.m === 'tabata') {
    const w = b.iv || 20;
    const rs = b.rs ?? 10;
    const n = b.v || 8;
    return (w + rs) * n - rs;
  }
  if (b.m === 'int') {
    const w = b.iv || 40;
    const rs = b.rs ?? 20;
    const n = b.v || 8;
    return (w + rs) * n - rs;
  }
  if (b.m === 'rest') return b.v;
  if (b.m === 'emom') return b.v * (b.iv || 60);
  if (b.m === 'up') return 0;
  return b.v * 60;
}

export function mixTotalSeconds(mix: MixBlock[]): number {
  return mix.reduce((s, b) => s + mixBlockSeconds(b), 0);
}
