import { mixTotalSeconds, totalMs, workRestRounds } from '@/lib/chrono/defaults';
import { fmt, ivLabel } from '@/lib/chrono/format';
import type { ChronoConfig } from '@/lib/chrono/types';

export function setupSummary(cfg: ChronoConfig): string {
  const m = cfg.mode;
  if (m === 'mix') {
    const n = cfg.mix.filter((x) => x.m !== 'rest').length;
    if (!cfg.mix.length) return 'Ajoute au moins un bloc.';
    return `${n} blocs, ${fmt(mixTotalSeconds(cfg.mix))} au total.`;
  }
  if (m === 'up') return 'Chronomètre libre, sans limite. Appuie sur Terminé pour l’arrêter.';
  if (m === 'down') return `Compte à rebours de ${fmt(cfg.down)}.`;
  if (m === 'int' || m === 'tabata') {
    const [w, rs, n] = workRestRounds(cfg);
    return `${n} rounds de ${w} s de travail et ${rs} s de repos, soit ${fmt(totalMs(cfg) / 1000)} au total.`;
  }
  if (m === 'amrap') return `Un maximum de rounds en ${cfg.amrap} min.`;
  if (m === 'fort') {
    return cfg.cap
      ? `Termine le plus vite possible, cap à ${fmt(cfg.cap * 60)}.`
      : 'Termine le plus vite possible, sans cap.';
  }
  if (m === 'emom') {
    return `Toutes les ${ivLabel(cfg.iv)} pendant ${cfg.rounds} rounds, soit ${fmt(totalMs(cfg) / 1000)} au total.`;
  }
  return '';
}
