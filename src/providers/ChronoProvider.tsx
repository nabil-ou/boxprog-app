import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_CONFIG, OTHER_FORMATS, presetBlock, type OtherFormatId } from '@/lib/chrono/defaults';
import { loadConfig, saveConfig } from '@/lib/chrono/persist';
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
  openOther: (id: OtherFormatId) => void;
  openEmpty: () => void;
  applySetupParams: (params: Record<string, string | undefined>) => void;
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
      commit({ ...cfg, mode: 'mix', mix: [block] });
    },
    [cfg, commit],
  );

  const openOther = useCallback(
    (id: OtherFormatId) => {
      const other = OTHER_FORMATS.find((f) => f.id === id);
      if (!other) return;
      setSessionName(other.title);
      commit({ ...cfg, mode: 'mix', mix: other.mix.map((b) => ({ ...b })) });
    },
    [cfg, commit],
  );

  const openEmpty = useCallback(() => {
    setSessionName('');
    commit({ ...cfg, mode: 'mix', mix: [] });
  }, [cfg, commit]);

  const applySetupParams = useCallback(
    (params: Record<string, string | undefined>) => {
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
      openOther,
      openEmpty,
      applySetupParams,
    }),
    [cfg, sessionName, setMode, patch, setMix, setFavs, openFormat, openOther, openEmpty, applySetupParams],
  );

  return <ChronoContext.Provider value={value}>{children}</ChronoContext.Provider>;
}

export function ensureChronoDefaults(cfg: ChronoConfig | null): ChronoConfig {
  return cfg ?? { ...DEFAULT_CONFIG, mix: [...DEFAULT_CONFIG.mix] };
}
