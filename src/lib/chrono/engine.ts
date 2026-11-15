import { totalMs, workRestRounds } from '@/lib/chrono/defaults';
import { fmt } from '@/lib/chrono/format';
import type { ChronoConfig, ChronoMode, MixBlock, RunPhase, RunSnapshot } from '@/lib/chrono/types';
import { MODE_NAMES } from '@/lib/chrono/types';

export type EngineFeedback = {
  /** Last-3-seconds countdown tick */
  beepTick?: boolean;
  beepGo?: boolean;
  beepEnd?: boolean;
  buzz?: 'short' | 'phase' | 'end' | 'tick';
};

function applyMixBlock(cfg: ChronoConfig, b: MixBlock): ChronoConfig {
  const next = { ...cfg };
  if (b.m === 'amrap') Object.assign(next, { mode: 'amrap' as const, amrap: b.v });
  else if (b.m === 'fort') Object.assign(next, { mode: 'fort' as const, cap: b.v });
  else if (b.m === 'emom') Object.assign(next, { mode: 'emom' as const, iv: b.iv || 60, rounds: b.v });
  else if (b.m === 'tabata')
    Object.assign(next, {
      mode: 'tabata' as const,
      tw: b.iv || 20,
      tr: b.rs ?? 10,
      tn: b.v || 8,
    });
  else if (b.m === 'int')
    Object.assign(next, {
      mode: 'int' as const,
      iw: b.iv || 40,
      ir: b.rs ?? 20,
      in: b.v || 8,
    });
  else if (b.m === 'up') Object.assign(next, { mode: 'up' as const });
  else Object.assign(next, { mode: 'down' as const, down: b.v });
  return next;
}

function blockLabel(mode: ChronoMode): string {
  const map: Record<string, string> = {
    amrap: 'AMRAP',
    fort: 'For Time',
    emom: 'EMOM',
    tabata: 'Tabata',
    int: 'Intervalle',
    up: 'Chrono',
    down: 'Repos',
  };
  return map[mode] || mode;
}

function nextBlockLabel(blocks: MixBlock[], fromIndex: number): string {
  const next = blocks[fromIndex + 1];
  if (!next) return '';
  if (next.m === 'rest') return `Repos ${fmt(next.v)}`;
  if (next.m === 'amrap') return `AMRAP ${next.v} min`;
  if (next.m === 'fort') return next.v ? `For Time cap ${next.v} min` : 'For Time';
  if (next.m === 'emom') return `EMOM ${next.v}×${fmt(next.iv || 60)}`;
  if (next.m === 'tabata') return `Tabata ${next.v || 8} rounds`;
  if (next.m === 'int') return `Intervalles ${next.v || 8} rounds`;
  if (next.m === 'up') return 'Libre';
  return next.m;
}

export class ChronoEngine {
  private cfg: ChronoConfig;
  private active: ChronoConfig;
  private phase: RunPhase = 'idle';
  private prevPhase: RunPhase = 'run';
  private start = 0;
  pauseAt = 0;
  private cd = 10000;
  private rounds = 0;
  private reps = 0;
  private splits: number[] = [];
  private lastKey = '';
  private lastRound = -1;
  private mixRun = false;
  private mixBlocks: MixBlock[] = [];
  private mixI = 0;
  private mixRes: string[] = [];
  private snap: ChronoConfig | null = null;
  private resultLines: string[] = [];
  private top = '';
  private sub = '';
  private big = '10';
  private bar = 0;
  private elapsedSec = 0;
  private tour = 0;
  private tourTotal = 0;
  private phaseLabel = '';
  private displayPhase: RunSnapshot['displayPhase'] = 'cd';
  private onChange: (s: RunSnapshot) => void;
  private onFeedback: (f: EngineFeedback) => void;
  private now: () => number;

  constructor(
    cfg: ChronoConfig,
    onChange: (s: RunSnapshot) => void,
    onFeedback: (f: EngineFeedback) => void,
    now: () => number = () => performance.now(),
  ) {
    this.cfg = cfg;
    this.active = { ...cfg };
    this.onChange = onChange;
    this.onFeedback = onFeedback;
    this.now = now;
  }

  getSnapshot(): RunSnapshot {
    const workBlocks = this.mixRun ? this.mixBlocks.filter((x) => x.m !== 'rest') : [];
    const workDone = this.mixRun
      ? this.mixBlocks.slice(0, this.mixI + 1).filter((x) => x.m !== 'rest').length
      : 1;
    return {
      phase: this.phase,
      displayPhase: this.displayPhase,
      top: this.top,
      sub: this.sub,
      big: this.big,
      bar: this.bar,
      rounds: this.rounds,
      reps: this.reps,
      resultLines: this.resultLines,
      mode: this.active.mode,
      mixRun: this.mixRun,
      blockIndex: this.mixRun ? Math.max(1, workDone) : 1,
      blockTotal: this.mixRun ? Math.max(1, workBlocks.length) : 1,
      elapsed: fmt(this.elapsedSec),
      tour: this.tour,
      tourTotal: this.tourTotal,
      nextLabel: this.mixRun ? nextBlockLabel(this.mixBlocks, this.mixI) : '',
      phaseLabel: this.phaseLabel,
    };
  }

  private emit() {
    this.onChange(this.getSnapshot());
  }

  private topName(): string {
    if (!this.mixRun) return MODE_NAMES[this.active.mode] || this.active.mode.toUpperCase();
    if (this.active.mode === 'down') return 'REPOS';
    return MODE_NAMES[this.active.mode] || this.active.mode.toUpperCase();
  }

  private setPhase(p: RunPhase) {
    this.phase = p;
    if (p === 'cd') this.displayPhase = 'cd';
    else if (p === 'pause') this.displayPhase = 'pause';
    else if (p === 'done') this.displayPhase = 'done';
    else this.displayPhase = 'run';
  }

  private countdownMs(): number {
    const s = Math.max(0, Math.min(60, this.cfg.cd ?? 10));
    return s * 1000;
  }

  begin() {
    this.mixRun = this.cfg.mode === 'mix';
    if (this.mixRun) {
      if (!this.cfg.mix.length) return false;
      this.snap = JSON.parse(JSON.stringify(this.cfg)) as ChronoConfig;
      this.mixBlocks = this.snap.mix;
      this.mixI = 0;
      this.mixRes = [];
      this.active = applyMixBlock(this.cfg, this.mixBlocks[0]);
    } else {
      this.active = { ...this.cfg };
      this.snap = null;
    }
    this.cd = this.countdownMs();
    this.splits = [];
    this.reps = 0;
    this.rounds = 0;
    this.lastKey = '';
    this.lastRound = -1;
    this.resultLines = [];
    this.elapsedSec = 0;
    this.tour = 0;
    this.tourTotal = 0;
    this.phaseLabel = 'Départ';
    this.onFeedback({ buzz: 'short' });
    this.top = this.topName();
    this.sub = 'Prépare-toi';
    this.big = String(Math.max(1, Math.round(this.cd / 1000)));
    this.bar = 0;
    this.start = this.now();
    this.setPhase('cd');
    this.emit();
    return true;
  }

  skipCountdown() {
    if (this.phase !== 'cd') return;
    this.start = this.now() - this.cd;
    this.tick();
  }

  togglePause() {
    if (this.phase === 'cd' || this.phase === 'run') {
      this.prevPhase = this.phase;
      this.pauseAt = this.now();
      this.setPhase('pause');
      this.top = 'PAUSE';
      this.sub = 'Touche pour reprendre';
      this.phaseLabel = 'Pause';
      this.emit();
    } else if (this.phase === 'pause') {
      this.start += this.now() - this.pauseAt;
      this.setPhase(this.prevPhase);
      this.top = this.topName();
      this.sub = '';
      this.phaseLabel = this.prevPhase === 'cd' ? 'Départ' : 'Go';
      this.emit();
    }
  }

  addRound() {
    this.rounds += 1;
    this.reps = 0;
    this.onFeedback({ buzz: 'tick' });
    this.emit();
  }

  removeRound() {
    if (this.rounds > 0) {
      this.rounds -= 1;
      this.emit();
    }
  }

  addRep(n = 1) {
    this.reps = Math.max(0, this.reps + n);
    this.emit();
  }

  lap() {
    this.splits.push(this.now() - this.start - this.cd);
    this.onFeedback({ buzz: 'tick' });
    this.emit();
  }

  finishManual() {
    this.finish('end', this.now() - this.start - this.cd);
  }

  /** End entire session (no next block). */
  abortSession() {
    this.onFeedback({ beepEnd: true, buzz: 'end' });
    this.setPhase('done');
    this.bar = 1;
    this.top = 'TERMINÉ';
    this.big = this.elapsedSec ? fmt(this.elapsedSec) : '00:00';
    this.sub = 'Séance arrêtée';
    this.phaseLabel = 'Fin';
    this.showRes();
    this.emit();
  }

  reset() {
    this.setPhase('idle');
    this.mixRun = false;
    this.resultLines = [];
    if (this.snap) {
      this.cfg = this.snap;
      this.snap = null;
    }
    this.emit();
  }

  private blockScore(kind: string, runE: number): string {
    const m = this.active.mode;
    if (m === 'amrap') {
      return (
        this.rounds +
        (this.rounds > 1 ? ' rounds' : ' round') +
        (this.reps ? ` + ${this.reps} reps` : '')
      );
    }
    if (m === 'fort' || m === 'up') return kind === 'cap' ? 'time cap' : fmt(Math.floor(runE / 1000));
    return 'fait';
  }

  private nextBlock() {
    this.mixI += 1;
    this.active = applyMixBlock(this.cfg, this.mixBlocks[this.mixI]);
    this.cd = this.active.mode === 'down' ? 0 : 3000;
    this.start = this.now();
    this.lastKey = '';
    this.lastRound = -1;
    this.rounds = 0;
    this.reps = 0;
    this.splits = [];
    this.tour = 0;
    this.tourTotal = 0;
    this.onFeedback({ buzz: 'phase' });
    this.setPhase('cd');
    this.top = this.topName();
    this.sub = '';
    this.phaseLabel = this.active.mode === 'down' ? 'Repos' : 'Départ';
    this.emit();
  }

  private showRes() {
    let lines: string[] = [];
    if (this.mixRun) {
      this.top = 'SÉANCE TERMINÉE';
      this.big = String(this.mixBlocks.filter((x) => x.m !== 'rest').length);
      this.sub = 'blocs terminés';
      lines = this.mixRes;
    } else if (this.active.mode === 'amrap' && this.reps) {
      this.sub = `rounds + ${this.reps} reps`;
    } else if ((this.active.mode === 'fort' || this.active.mode === 'up') && this.splits.length) {
      lines = this.splits.map((s, i) => {
        const prev = this.splits[i - 1] || 0;
        return `Tour ${i + 1}   ${fmt(Math.floor(s / 1000))}   (+${fmt(Math.floor((s - prev) / 1000))})`;
      });
    }
    this.resultLines = lines;
  }

  private finish(kind: string, runE: number) {
    if (this.mixRun) {
      if (this.active.mode !== 'down') {
        this.mixRes.push(`${blockLabel(this.active.mode)}\u00a0: ${this.blockScore(kind, runE)}`);
      }
      if (this.mixI < this.mixBlocks.length - 1) {
        this.nextBlock();
        return;
      }
    }
    this.onFeedback({ beepEnd: true, buzz: 'end' });
    this.setPhase('done');
    this.bar = 1;
    this.phaseLabel = 'Fin';
    const m = this.active.mode;
    if (m === 'down') {
      this.top = 'TERMINÉ';
      this.big = '00:00';
      this.sub = 'Temps écoulé';
    } else if (m === 'int' || m === 'tabata') {
      this.top = 'TERMINÉ';
      this.big = String(workRestRounds(this.active)[2]);
      this.sub = 'rounds faits';
    } else if (m === 'amrap') {
      this.top = 'TERMINÉ';
      this.big = String(this.rounds);
      this.sub = this.rounds > 1 ? 'rounds complétés' : 'round complété';
    } else if (m === 'fort' || m === 'up') {
      this.top = kind === 'cap' ? 'TIME CAP' : 'TERMINÉ';
      const T = totalMs(this.active);
      this.big = fmt(Math.floor(Math.min(runE, T || runE) / 1000));
      this.sub = kind === 'cap' ? 'Cap atteint' : 'Ton temps';
    } else {
      this.top = 'TERMINÉ';
      this.big = String(this.active.rounds);
      this.sub = 'rounds EMOM faits';
    }
    this.showRes();
    this.emit();
  }

  private subFort(T: number): string {
    const n = this.splits.length;
    const last = n ? this.splits[n - 1] - (this.splits[n - 2] || 0) : 0;
    const tour = n ? `Tour ${n} : ${fmt(Math.floor(last / 1000))}` : '';
    const cap = T ? `${n ? '   ' : ''}Cap ${fmt(T / 1000)}` : '';
    return tour + cap;
  }

  tick() {
    if (this.phase !== 'cd' && this.phase !== 'run') return;
    const e = this.now() - this.start;
    if (e < this.cd) {
      const s = Math.ceil((this.cd - e) / 1000);
      this.big = String(s);
      this.bar = e / this.cd;
      this.elapsedSec = 0;
      this.phaseLabel = 'Départ';
      const k = `cd${s}`;
      if (k !== this.lastKey) {
        this.lastKey = k;
        if (s <= 3) this.onFeedback({ beepTick: true, buzz: 'tick' });
      }
      this.emit();
      return;
    }
    if (this.phase === 'cd') {
      this.setPhase('run');
      this.onFeedback({ beepGo: true, buzz: 'phase' });
      this.lastKey = '';
      this.sub = '';
      this.top = this.topName();
      this.phaseLabel = this.active.mode === 'down' ? 'Repos' : 'Travail';
    }
    const r = e - this.cd;
    this.elapsedSec = Math.floor(r / 1000);
    const T = totalMs(this.active);
    const m = this.active.mode;

    if (m === 'amrap' || m === 'down') {
      if (r >= T) return this.finish('end', r);
      const left = Math.ceil((T - r) / 1000);
      this.big = fmt(left);
      this.bar = r / T;
      this.sub = '';
      this.displayPhase = 'run';
      this.phaseLabel = m === 'down' ? 'Repos' : 'Restant';
      this.tour = 0;
      this.tourTotal = 0;
      const k = `a${left}`;
      if (k !== this.lastKey) {
        this.lastKey = k;
        if (left <= 3) this.onFeedback({ beepTick: true, buzz: 'tick' });
      }
    } else if (m === 'fort' || m === 'up') {
      if (T && r >= T) return this.finish('cap', r);
      this.big = fmt(Math.floor(r / 1000));
      this.bar = T ? r / T : Math.min(1, (r % 60000) / 60000);
      this.sub = this.subFort(T);
      this.displayPhase = 'run';
      this.phaseLabel = 'Écoulé';
      this.tour = this.splits.length;
      this.tourTotal = 0;
    } else if (m === 'int' || m === 'tabata') {
      if (r >= T) return this.finish('end', r);
      const [w, rs, n] = workRestRounds(this.active);
      const cy = (w + rs) * 1000;
      const rd = Math.floor(r / cy);
      const pos = r % cy;
      const wk = pos < w * 1000;
      const left = Math.ceil(((wk ? w * 1000 : cy) - pos) / 1000);
      const idx = rd * 2 + (wk ? 0 : 1);
      const len = wk ? w * 1000 : rs * 1000;
      const off = wk ? pos : pos - w * 1000;
      this.displayPhase = wk ? 'run' : 'rest';
      this.top = wk ? 'TRAVAIL' : 'REPOS';
      this.sub = `Round ${rd + 1} / ${n}`;
      this.big = fmt(left);
      this.bar = off / len;
      this.tour = rd + 1;
      this.tourTotal = n;
      this.phaseLabel = wk ? 'Travail' : 'Repos';
      if (idx !== this.lastRound) {
        this.lastRound = idx;
        this.onFeedback({ buzz: 'phase' });
      }
      const k = `i${idx}:${left}`;
      if (k !== this.lastKey) {
        this.lastKey = k;
        if (left <= 3 && left > 0) this.onFeedback({ beepTick: true, buzz: 'tick' });
      }
    } else {
      // emom
      if (r >= T) return this.finish('end', r);
      const ivm = this.active.iv * 1000;
      const rd = Math.floor(r / ivm);
      const left = Math.ceil((ivm - (r % ivm)) / 1000);
      this.big = fmt(left);
      this.bar = (r % ivm) / ivm;
      this.sub = `Round ${rd + 1} / ${this.active.rounds}`;
      this.displayPhase = 'run';
      this.tour = rd + 1;
      this.tourTotal = this.active.rounds;
      this.phaseLabel = 'Intervalle';
      if (rd !== this.lastRound) {
        this.lastRound = rd;
        this.onFeedback({ buzz: 'phase' });
      }
      const k = `e${rd}:${left}`;
      if (k !== this.lastKey) {
        this.lastKey = k;
        if (left <= 3 && left > 0) this.onFeedback({ beepTick: true, buzz: 'tick' });
      }
    }
    this.emit();
  }
}
