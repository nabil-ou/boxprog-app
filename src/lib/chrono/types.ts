export type ChronoMode = 'amrap' | 'fort' | 'emom' | 'tabata' | 'int' | 'up' | 'down' | 'mix';

export type MixBlockKind = 'amrap' | 'fort' | 'emom' | 'tabata' | 'int' | 'up' | 'rest';

export interface MixBlock {
  m: MixBlockKind;
  /** minutes (amrap/fort) | rounds (emom/int/tabata) | seconds (rest) | unused (up) */
  v: number;
  /** interval sec (emom) | work sec (int/tabata) */
  iv?: number;
  /** rest sec (int/tabata) */
  rs?: number;
}

export interface MixFavorite {
  name: string;
  mix: MixBlock[];
}

export interface ChronoConfig {
  mode: ChronoMode;
  amrap: number;
  cap: number;
  iv: number;
  rounds: number;
  tw: number;
  tr: number;
  tn: number;
  iw: number;
  ir: number;
  in: number;
  down: number;
  /** Countdown before start, seconds */
  cd: number;
  voice: boolean;
  vib: boolean;
  favs: MixFavorite[];
  mix: MixBlock[];
}

export type RunPhase = 'idle' | 'cd' | 'run' | 'pause' | 'done';

export interface RunSnapshot {
  phase: RunPhase;
  displayPhase: 'cd' | 'run' | 'rest' | 'pause' | 'done';
  top: string;
  sub: string;
  big: string;
  bar: number;
  rounds: number;
  reps: number;
  resultLines: string[];
  mode: ChronoMode;
  mixRun: boolean;
  /** Current work block index (1-based among non-rest) */
  blockIndex: number;
  /** Total work blocks */
  blockTotal: number;
  /** Elapsed run time mm:ss (excludes countdown) */
  elapsed: string;
  /** Current tour / round (1-based), 0 if N/A */
  tour: number;
  /** Total tours / rounds, 0 if N/A */
  tourTotal: number;
  /** Label for next mix block, empty if none */
  nextLabel: string;
  /** Short phase label under the ring */
  phaseLabel: string;
}

export const MODE_COLORS: Record<ChronoMode, string> = {
  amrap: '#DB7A0A',
  fort: '#526DFF',
  emom: '#9B00E3',
  tabata: '#0FA574',
  int: '#D63384',
  mix: '#FFD60A',
  up: '#D8372A',
  down: '#0A89A8',
};

export const MODE_NAMES: Record<ChronoMode, string> = {
  amrap: 'AMRAP',
  fort: 'FOR TIME',
  emom: 'EMOM',
  tabata: 'TABATA',
  int: 'INTERVALLES',
  mix: 'MIX',
  up: 'LIBRE',
  down: 'CHRONO ↓',
};

export const STAGE_COLORS = {
  cd: { bg: '#F2B91C', fg: '#1D2433' },
  run: { bg: '#C9301F', fg: '#FFFFFF' },
  rest: { bg: '#2C5FB8', fg: '#FFFFFF' },
  pause: { bg: '#3F4A60', fg: '#FFFFFF' },
  done: { bg: '#1E7A45', fg: '#FFFFFF' },
} as const;

/** Home grid formats (Libre = Chrono ↑). */
export type HomeFormat = 'amrap' | 'fort' | 'emom' | 'tabata' | 'int' | 'up';
