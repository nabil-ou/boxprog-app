import 'expo-sqlite/localStorage/install';

import { DEFAULT_CONFIG } from '@/lib/chrono/defaults';
import type { ChronoConfig, ChronoMode, MixBlock, MixFavorite } from '@/lib/chrono/types';

const KEY = 'wod-chrono-v1';

function sanitize(raw: Partial<ChronoConfig>): ChronoConfig {
  const base = { ...DEFAULT_CONFIG, ...raw };
  base.voice = Boolean(raw.voice ?? DEFAULT_CONFIG.voice);
  base.vib = Boolean(raw.vib ?? DEFAULT_CONFIG.vib);
  base.cd = Number.isFinite(Number(raw.cd)) ? Math.max(0, Math.min(60, Number(raw.cd))) : DEFAULT_CONFIG.cd;
  base.favs = Array.isArray(raw.favs) ? (raw.favs as MixFavorite[]) : [];
  base.mix = Array.isArray(raw.mix) ? (raw.mix as MixBlock[]) : [...DEFAULT_CONFIG.mix];
  const modes: ChronoMode[] = ['amrap', 'fort', 'emom', 'tabata', 'int', 'up', 'down', 'mix'];
  if (!modes.includes(base.mode)) base.mode = 'amrap';
  return base;
}

export function loadConfig(): ChronoConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_CONFIG, mix: [...DEFAULT_CONFIG.mix] };
    return sanitize(JSON.parse(raw) as Partial<ChronoConfig>);
  } catch {
    return { ...DEFAULT_CONFIG, mix: [...DEFAULT_CONFIG.mix] };
  }
}

export function saveConfig(cfg: ChronoConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* ignore quota */
  }
}
