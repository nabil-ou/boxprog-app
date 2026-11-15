import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChronoEngine, type EngineFeedback } from '@/lib/chrono/engine';
import { beepEnd, beepGo, beepTick, buzz } from '@/lib/chrono/feedback';
import type { ChronoConfig, RunSnapshot } from '@/lib/chrono/types';

const KEEP = 'chrono-wod';

const idleSnap = (cfg: ChronoConfig): RunSnapshot => ({
  phase: 'idle',
  displayPhase: 'cd',
  top: '',
  sub: '',
  big: '10',
  bar: 0,
  rounds: 0,
  reps: 0,
  resultLines: [],
  mode: cfg.mode === 'mix' && cfg.mix[0] ? (cfg.mix[0].m === 'rest' ? 'down' : cfg.mix[0].m) : cfg.mode,
  mixRun: false,
  blockIndex: 1,
  blockTotal: 1,
  elapsed: '00:00',
  tour: 0,
  tourTotal: 0,
  nextLabel: '',
  phaseLabel: '',
});

export function useChronoRunner(cfg: ChronoConfig) {
  const [snap, setSnap] = useState<RunSnapshot>(() => idleSnap(cfg));
  const engineRef = useRef<ChronoEngine | null>(null);
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const feedback = useCallback((f: EngineFeedback) => {
    const c = cfgRef.current;
    const sound = c.voice; // persisted flag = sons (bips), no speech
    if (sound) {
      if (f.beepGo) void beepGo();
      else if (f.beepEnd) void beepEnd();
      else if (f.beepTick) void beepTick();
    }
    if (f.buzz) void buzz(c.vib, f.buzz);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    void deactivateKeepAwake(KEEP);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    void activateKeepAwakeAsync(KEEP);
    timerRef.current = setInterval(() => engineRef.current?.tick(), 50);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const begin = useCallback(() => {
    const eng = new ChronoEngine(cfgRef.current, setSnap, feedback);
    engineRef.current = eng;
    if (!eng.begin()) return false;
    startTimer();
    return true;
  }, [feedback, startTimer]);

  const reset = useCallback(() => {
    stopTimer();
    engineRef.current?.reset();
    engineRef.current = null;
    setSnap(idleSnap(cfgRef.current));
  }, [stopTimer]);

  const skip = useCallback(() => engineRef.current?.skipCountdown(), []);
  const togglePause = useCallback(() => engineRef.current?.togglePause(), []);
  const finish = useCallback(() => {
    engineRef.current?.abortSession();
  }, []);
  const finishBlock = useCallback(() => {
    engineRef.current?.finishManual();
  }, []);
  const lap = useCallback(() => engineRef.current?.lap(), []);
  const addRound = useCallback(() => engineRef.current?.addRound(), []);
  const removeRound = useCallback(() => engineRef.current?.removeRound(), []);
  const addRep = useCallback((n: number) => engineRef.current?.addRep(n), []);

  useEffect(() => {
    if (snap.phase === 'done') stopTimer();
  }, [snap.phase, stopTimer]);

  return {
    snap,
    begin,
    reset,
    skip,
    togglePause,
    finish,
    finishBlock,
    lap,
    addRound,
    removeRound,
    addRep,
    active: snap.phase !== 'idle',
  };
}
