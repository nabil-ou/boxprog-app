import type { ChronoMode } from '@/lib/chrono/types';
import type { TimerFormat } from '@/lib/types';

export type SetupParams = {
  mode: ChronoMode;
  amrap?: number;
  cap?: number;
  iv?: number;
  rounds?: number;
  tw?: number;
  tr?: number;
  tn?: number;
};

/** Map a programming block timer to chrono setup params. */
export function mapBlockToSetup(timerFormat: TimerFormat, minutes: number): SetupParams | null {
  if (!timerFormat) return null;
  const m = Math.max(1, Math.round(minutes) || 1);
  if (timerFormat === 'amrap') return { mode: 'amrap', amrap: Math.min(90, m) };
  if (timerFormat === 'fortime') return { mode: 'fort', cap: Math.min(90, m) };
  if (timerFormat === 'emom') return { mode: 'emom', iv: 60, rounds: Math.min(99, m) };
  if (timerFormat === 'tabata') return { mode: 'tabata', tw: 20, tr: 10, tn: 8 };
  return null;
}

export function setupParamsToQuery(p: SetupParams): Record<string, string> {
  const q: Record<string, string> = { mode: p.mode };
  if (p.amrap != null) q.amrap = String(p.amrap);
  if (p.cap != null) q.cap = String(p.cap);
  if (p.iv != null) q.iv = String(p.iv);
  if (p.rounds != null) q.rounds = String(p.rounds);
  if (p.tw != null) q.tw = String(p.tw);
  if (p.tr != null) q.tr = String(p.tr);
  if (p.tn != null) q.tn = String(p.tn);
  return q;
}
