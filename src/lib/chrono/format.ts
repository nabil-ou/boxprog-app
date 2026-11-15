export const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

export function ivLabel(v: number): string {
  if (v < 60) return `${v} s`;
  const m = Math.floor(v / 60);
  const sec = v % 60;
  return sec ? `${m} min ${String(sec).padStart(2, '0')}` : `${m} min`;
}

/** Step for interval-like fields (seconds). */
export function intervalStep(ref: number, dir: number): number {
  return (dir > 0 ? ref : ref - 1) < 60 ? 5 : 30;
}

/** Step for duration in seconds (countdown / work / rest). */
export function durationStep(ref: number): number {
  if (ref < 120) return 5;
  if (ref < 600) return 15;
  return 60;
}
