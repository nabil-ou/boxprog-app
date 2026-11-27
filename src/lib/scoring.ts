import { pad } from '@/lib/dates';
import { singleLevelKind, type Block, type Level, type ScoreType, type TimerFormat } from '@/lib/types';

const FORMATS: Record<TimerFormat, string> = {
  '': 'Sans timer',
  amrap: 'AMRAP',
  emom: 'EMOM',
  fortime: 'For Time',
  tabata: 'Tabata',
};

export const fmtClock = (s: number) => {
  s = Math.max(0, Math.round(s));
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
};

/** Encodage : rounds = r*100+reps · time = secondes · load = valeur brute. */
export function encodeScore(type: ScoreType, a: number, b: number): number {
  if (type === 'rounds') return a * 100 + Math.min(99, b);
  if (type === 'time') return a * 60 + Math.min(59, b);
  return a;
}

export function decodeScore(type: ScoreType, v: number): [number, number] {
  if (type === 'rounds') return [Math.floor(v / 100), v % 100];
  if (type === 'time') return [Math.floor(v / 60), v % 60];
  return [v, 0];
}

export function showScore(type: ScoreType, v: number): string {
  if (type === 'time') return fmtClock(v);
  if (type === 'rounds') return Math.floor(v / 100) + ' + ' + (v % 100);
  return String(v);
}

export const compareScores = (type: ScoreType) => (x: { value: number }, y: { value: number }) =>
  type === 'time' ? x.value - y.value : y.value - x.value;

/** Elite → elite, Inter → scaled, Scaled → beginner, RX → rx. Un niveau vide retombe sur RX.
 *  Warm-up, Mobilité, Force et Cool down n'ont qu'un texte, le même pour tous les niveaux. */
export function levelText(b: Pick<Block, 'rx' | 'scaled' | 'beginner' | 'elite'> & { kind?: string }, l: Level): string {
  if (b.kind && singleLevelKind(b.kind)) return b.rx;
  return (l === 'Elite' ? b.elite : l === 'Inter' ? b.scaled : l === 'Scaled' ? b.beginner : b.rx) || b.rx;
}

export const blockTitle = (b: Block) => b.kind;

export function blockSubtitle(b: Pick<Block, 'timer_format' | 'minutes'>): string {
  return b.timer_format ? FORMATS[b.timer_format] + (b.timer_format !== 'tabata' ? ` ${b.minutes}'` : '') : '';
}
