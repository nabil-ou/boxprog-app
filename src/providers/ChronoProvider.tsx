import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_CONFIG, presetBlock } from '@/lib/chrono/defaults';
import { loadConfig, newFavoriteId, saveConfig } from '@/lib/chrono/persist';
import type { ChronoConfig, ChronoMode, HomeFormat, MixBlock, MixFavorite } from '@/lib/chrono/types';
import { MODE_NAMES } from '@/lib/chrono/types';

interface ChronoState {
  cfg: ChronoConfig;
  sessionName: string;
  setSessionName: (name: string) => void;
  setMode: (mode: ChronoMode) => void;
  patch: (partial: Partial<ChronoConfig>) => void;
  setMix: (mix: MixBlock[]) => void;
  setFavs: (favs: MixFavorite[]) => void;
  openFormat: (format: HomeFormat) => void;
  openEmpty: () => void;
  applySetupParams: (params: Record<string, string | undefined>) => void;
  activeFavId: string | null;
  /** The open chrono differs from its saved favorite. */
  favDirty: boolean;
  openFavorite: (id: string) => void;
  saveFavorite: (opts?: { asNew?: boolean }) => void;
  deleteFavorite: (id: string) => void;
}

const DEFAULT_FAV_NAME = 'Mon chrono';

function sameMix(a: MixBlock[], b: MixBlock[]): boolean {
  return (
    a.length === b.length &&
    a.every((x, i) => {
      const y = b[i]!;
      return x.m === y.m && x.v === y.v && x.iv === y.iv && x.rs === y.rs;
    })
  );
}

const ChronoContext = createContext<ChronoState | null>(null);

export function useChronoConfig() {
  const ctx = useContext(ChronoContext);
  if (!ctx) throw new Error('useChronoConfig hors ChronoProvider');
  return ctx;
}

function paramsToMix(params: Record<string, string | undefined>): MixBlock[] | null {
  const mode = params.mode as ChronoMode | undefined;
  if (!mode || mode === 'mix') return null;
  const num = (k: string, fallback: number) => {
    const v = Number(params[k]);
    return Number.isFinite(v) ? v : fallback;
  };
  if (mode === 'amrap') return [{ m: 'amrap', v: num('amrap', 12) }];
  if (mode === 'fort') return [{ m: 'fort', v: num('cap', 15) }];
  if (mode === 'emom') return [{ m: 'emom', v: num('rounds', 10), iv: num('iv', 60) }];
  if (mode === 'tabata')
    return [{ m: 'tabata', v: num('tn', 8), iv: num('tw', 20), rs: num('tr', 10) }];
  if (mode === 'int')
    return [{ m: 'int', v: num('in', 8), iv: num('iw', 40), rs: num('ir', 20) }];
  if (mode === 'up') return [{ m: 'up', v: 0 }];
  if (mode === 'down') return [{ m: 'rest', v: num('down', 300) }];
  return null;
}

export function ChronoProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<ChronoConfig>(() => loadConfig());
  const [sessionName, setSessionName] = useState('');
  const [activeFavId, setActiveFavId] = useState<string | null>(null);

  const commit = useCallback((next: ChronoConfig) => {
    setCfg(next);
    saveConfig(next);
  }, []);

  const setMode = useCallback(
    (mode: ChronoMode) => {
      commit({ ...cfg, mode });
    },
    [cfg, commit],
  );

  const patch = useCallback(
    (partial: Partial<ChronoConfig>) => {
      commit({ ...cfg, ...partial });
    },
    [cfg, commit],
  );

  const setMix = useCallback(
    (mix: MixBlock[]) => {
      commit({ ...cfg, mix, mode: 'mix' });
    },
    [cfg, commit],
  );

  const setFavs = useCallback(
    (favs: MixFavorite[]) => {
      commit({ ...cfg, favs });
    },
    [cfg, commit],
  );

  const openFormat = useCallback(
    (format: HomeFormat) => {
      const block = presetBlock(format);
      setSessionName(MODE_NAMES[format]);
      setActiveFavId(null);
      commit({ ...cfg, mode: 'mix', mix: [block] });
    },
    [cfg, commit],
  );

  const openEmpty = useCallback(() => {
    setSessionName('');
    setActiveFavId(null);
    commit({ ...cfg, mode: 'mix', mix: [] });
  }, [cfg, commit]);

  const applySetupParams = useCallback(
    (params: Record<string, string | undefined>) => {
      setActiveFavId(null);
      const asMix = paramsToMix(params);
      if (asMix) {
        const title = MODE_NAMES[(params.mode as ChronoMode) || 'amrap'] || '';
        setSessionName(title);
        commit({ ...cfg, mode: 'mix', mix: asMix });
        return;
      }
      const mode = (params.mode as ChronoMode) || cfg.mode;
      const next: ChronoConfig = { ...cfg, mode };
      const num = (k: string, fallback: number) => {
        const v = Number(params[k]);
        return Number.isFinite(v) ? v : fallback;
      };
      if (params.amrap != null) next.amrap = num('amrap', next.amrap);
      if (params.cap != null) next.cap = num('cap', next.cap);
      if (params.iv != null) next.iv = num('iv', next.iv);
      if (params.rounds != null) next.rounds = num('rounds', next.rounds);
      if (params.tw != null) next.tw = num('tw', next.tw);
      if (params.tr != null) next.tr = num('tr', next.tr);
      if (params.tn != null) next.tn = num('tn', next.tn);
      if (params.iw != null) next.iw = num('iw', next.iw);
      if (params.ir != null) next.ir = num('ir', next.ir);
      if (params.in != null) next.in = num('in', next.in);
      if (params.down != null) next.down = num('down', next.down);
      if (params.cd != null) next.cd = num('cd', next.cd);
      commit(next);
    },
    [cfg, commit],
  );

  const openFavorite = useCallback(
    (id: string) => {
      const fav = cfg.favs.find((f) => f.id === id);
      if (!fav) return;
      setSessionName(fav.name);
      setActiveFavId(fav.id);
      commit({
        ...cfg,
        mode: 'mix',
        mix: fav.mix.map((b) => ({ ...b })),
        cd: fav.cd ?? cfg.cd,
      });
    },
    [cfg, commit],
  );

  const saveFavorite = useCallback(
    (opts?: { asNew?: boolean }) => {
      const name = sessionName.trim() || DEFAULT_FAV_NAME;
      const data = {
        name,
        mix: cfg.mix.map((b) => ({ ...b })),
        cd: cfg.cd,
        updatedAt: Date.now(),
      };
      const existing =
        !opts?.asNew && activeFavId ? cfg.favs.find((f) => f.id === activeFavId) : undefined;
      if (existing) {
        commit({
          ...cfg,
          favs: cfg.favs.map((f) => (f.id === existing.id ? { ...f, ...data } : f)),
        });
      } else {
        const fav: MixFavorite = { id: newFavoriteId(), ...data };
        commit({ ...cfg, favs: [fav, ...cfg.favs] });
        setActiveFavId(fav.id);
      }
      setSessionName(name);
    },
    [cfg, commit, sessionName, activeFavId],
  );

  const deleteFavorite = useCallback(
    (id: string) => {
      commit({ ...cfg, favs: cfg.favs.filter((f) => f.id !== id) });
      if (activeFavId === id) setActiveFavId(null);
    },
    [cfg, commit, activeFavId],
  );

  const favDirty = useMemo(() => {
    const fav = activeFavId ? cfg.favs.find((f) => f.id === activeFavId) : undefined;
    if (!fav) return false;
    return (
      (sessionName.trim() || DEFAULT_FAV_NAME) !== fav.name ||
      (fav.cd !== undefined && fav.cd !== cfg.cd) ||
      !sameMix(cfg.mix, fav.mix)
    );
  }, [activeFavId, cfg.favs, cfg.cd, cfg.mix, sessionName]);

  const value = useMemo(
    () => ({
      cfg,
      sessionName,
      setSessionName,
      setMode,
      patch,
      setMix,
      setFavs,
      openFormat,
      openEmpty,
      applySetupParams,
      activeFavId,
      favDirty,
      openFavorite,
      saveFavorite,
      deleteFavorite,
    }),
    [
      cfg,
      sessionName,
      setMode,
      patch,
      setMix,
      setFavs,
      openFormat,
      openEmpty,
      applySetupParams,
      activeFavId,
      favDirty,
      openFavorite,
      saveFavorite,
      deleteFavorite,
    ],
  );

  return <ChronoContext.Provider value={value}>{children}</ChronoContext.Provider>;
}

export function ensureChronoDefaults(cfg: ChronoConfig | null): ChronoConfig {
  return cfg ?? { ...DEFAULT_CONFIG, mix: [...DEFAULT_CONFIG.mix] };
}
