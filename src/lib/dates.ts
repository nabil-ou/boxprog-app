/** Dates locales en chaînes ISO « YYYY-MM-DD » (même convention que Boxprog web). */

export const pad = (n: number) => (n < 10 ? '0' : '') + n;

export function iso(d: Date): string {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

export function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return iso(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** ISO weekday : 1 = lundi … 7 = dimanche */
export function isoDow(s: string): number {
  const g = parse(s).getDay();
  return g === 0 ? 7 : g;
}

export function mondayOf(s: string): string {
  return addDays(s, 1 - isoDow(s));
}

/** Les 7 jours de la semaine à partir du lundi. */
export function fullWeek(monday: string): string[] {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(monday, i));
}

export function weekDays(monday: string, training: number[]): string[] {
  const set = new Set(training.length ? training : [1, 2, 3, 4, 5, 6]);
  return [1, 2, 3, 4, 5, 6, 7].filter((d) => set.has(d)).map((d) => addDays(monday, d - 1));
}

const DOW_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const DOW_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const MONTHS_TITLE = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const dowShort = (s: string) => DOW_SHORT[isoDow(s) - 1];
export const dowLong = (s: string) => DOW_LONG[isoDow(s) - 1];
export const dayNum = (s: string) => parse(s).getDate();
export const longDate = (s: string) => `${dowLong(s)} ${dayNum(s)} ${MONTHS[parse(s).getMonth()]}`;
export const monthTitle = (s: string) => `${MONTHS_TITLE[parse(s).getMonth()]} ${parse(s).getFullYear()}`;

/** Premier jour du mois (YYYY-MM-DD). */
export function startOfMonth(s: string): string {
  const d = parse(s);
  return iso(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function addMonths(s: string, n: number): string {
  const d = parse(s);
  return iso(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

/** Grille calendrier lundi→dimanche pour un mois (cases hors mois = null). */
export function monthGrid(monthStart: string): (string | null)[] {
  const first = parse(monthStart);
  const startPad = isoDow(monthStart) - 1;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(iso(new Date(first.getFullYear(), first.getMonth(), d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function fmtDateTime(isoTs: string): string {
  const d = new Date(isoTs);
  const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${dowLong(iso(d)).toLowerCase()} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} à ${pad(d.getHours())}h${pad(d.getMinutes())}`;
}
