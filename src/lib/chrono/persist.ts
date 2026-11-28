import 'expo-sqlite/localStorage/install';

import { DEFAULT_CONFIG } from '@/lib/chrono/defaults';
import type { ChronoConfig, ChronoMode, MixBlock, MixFavorite } from '@/lib/chrono/types';

const KEY = 'wod-chrono-v1';

export function newFavoriteId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFavs(raw: unknown): MixFavorite[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (f): f is Partial<MixFavorite> =>
        typeof f === 'object' && f !== null && Array.isArray((f as MixFavorite).mix),
    )
    .map((f) => ({
      id: typeof f.id === 'string' && f.id ? f.id : newFavoriteId(),
      name: typeof f.name === 'string' && f.name.trim() ? f.name : 'Mon chrono',
      mix: f.mix as MixBlock[],
      cd: Number.isFinite(Number(f.cd)) ? Math.max(0, Math.min(60, Number(f.cd))) : undefined,
      updatedAt: Number.isFinite(Number(f.updatedAt)) ? Number(f.updatedAt) : 0,
    }));
}

function sanitize(raw: Partial<ChronoConfig>): ChronoConfig {
  const base = { ...DEFAULT_CONFIG, ...raw };
  base.voice = Boolean(raw.voice ?? DEFAULT_CONFIG.voice);
  base.vib = Boolean(raw.vib ?? DEFAULT_CONFIG.vib);
  base.cd = Number.isFinite(Number(raw.cd)) ? Math.max(0, Math.min(60, Number(raw.cd))) : DEFAULT_CONFIG.cd;
  base.favs = sanitizeFavs(raw.favs);
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
