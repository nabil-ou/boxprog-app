import type { LucideIcon } from 'lucide-react-native';
import { Dumbbell, HeartPulse, PersonStanding, Timer } from 'lucide-react-native';

export type PrCategory = 'lift' | 'gym' | 'cardio' | 'benchmarks';

export type PrFamilyId =
  | 'squats'
  | 'presses'
  | 'cleans'
  | 'jerks'
  | 'snatches'
  | 'deadlifts'
  | 'olympic'
  | 'pull'
  | 'ttb'
  | 'dips'
  | 'hs'
  | 'muscle'
  | 'legs'
  | 'weighted'
  | 'run'
  | 'row'
  | 'bike'
  | 'girls'
  | 'heroes';

export type PrUnit = 'kg' | 'reps' | 's' | 'm';

export interface PrFamily {
  id: PrFamilyId;
  label: string;
  category: PrCategory;
}

export interface PrMovement {
  id: string;
  name: string;
  family: PrFamilyId;
  category: PrCategory;
  unit: PrUnit;
}

export const PR_CATEGORIES: {
  id: PrCategory;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: 'lift', label: 'Lift', Icon: Dumbbell },
  { id: 'gym', label: 'Gym', Icon: PersonStanding },
  { id: 'cardio', label: 'Cardio', Icon: HeartPulse },
  { id: 'benchmarks', label: 'Benchmarks', Icon: Timer },
];

export const PR_FAMILIES: PrFamily[] = [
  { id: 'squats', label: 'Squats', category: 'lift' },
  { id: 'presses', label: 'Presses', category: 'lift' },
  { id: 'cleans', label: 'Cleans', category: 'lift' },
  { id: 'jerks', label: 'Jerks', category: 'lift' },
  { id: 'snatches', label: 'Snatches', category: 'lift' },
  { id: 'deadlifts', label: 'Deadlifts', category: 'lift' },
  { id: 'olympic', label: 'Olympic', category: 'lift' },
  { id: 'pull', label: 'Pull-ups', category: 'gym' },
  { id: 'ttb', label: 'Toes to bar', category: 'gym' },
  { id: 'dips', label: 'Dips', category: 'gym' },
  { id: 'hs', label: 'HSPU', category: 'gym' },
  { id: 'muscle', label: 'Muscle-up', category: 'gym' },
  { id: 'legs', label: 'Legs', category: 'gym' },
  { id: 'weighted', label: 'Weighted', category: 'gym' },
  { id: 'run', label: 'Run', category: 'cardio' },
  { id: 'row', label: 'Row', category: 'cardio' },
  { id: 'bike', label: 'Bike', category: 'cardio' },
  { id: 'girls', label: 'Girls', category: 'benchmarks' },
  { id: 'heroes', label: 'Heroes', category: 'benchmarks' },
];

export const PR_MOVEMENTS: PrMovement[] = [
  // Lift — Squats
  { id: 'back-squat', name: 'Back squat', family: 'squats', category: 'lift', unit: 'kg' },
  { id: 'front-squat', name: 'Front squat', family: 'squats', category: 'lift', unit: 'kg' },
  { id: 'oh-squat', name: 'Overhead squat', family: 'squats', category: 'lift', unit: 'kg' },
  // Lift — Presses
  { id: 'bench-press', name: 'Bench press', family: 'presses', category: 'lift', unit: 'kg' },
  { id: 'strict-press', name: 'Strict press', family: 'presses', category: 'lift', unit: 'kg' },
  { id: 'push-press', name: 'Push press', family: 'presses', category: 'lift', unit: 'kg' },
  { id: 'thruster', name: 'Thruster', family: 'presses', category: 'lift', unit: 'kg' },
  { id: 'cluster', name: 'Cluster', family: 'presses', category: 'lift', unit: 'kg' },
  // Lift — Cleans
  { id: 'squat-clean', name: 'Squat clean', family: 'cleans', category: 'lift', unit: 'kg' },
  { id: 'power-clean', name: 'Power clean', family: 'cleans', category: 'lift', unit: 'kg' },
  { id: 'hang-squat-clean', name: 'Hang squat clean', family: 'cleans', category: 'lift', unit: 'kg' },
  { id: 'hang-power-clean', name: 'Hang power clean', family: 'cleans', category: 'lift', unit: 'kg' },
  { id: 'muscle-clean', name: 'Muscle clean', family: 'cleans', category: 'lift', unit: 'kg' },
  // Lift — Jerks
  { id: 'push-jerk', name: 'Push jerk', family: 'jerks', category: 'lift', unit: 'kg' },
  { id: 'split-jerk', name: 'Split jerk', family: 'jerks', category: 'lift', unit: 'kg' },
  // Lift — Snatches (mêmes variantes que cleans)
  { id: 'squat-snatch', name: 'Squat snatch', family: 'snatches', category: 'lift', unit: 'kg' },
  { id: 'power-snatch', name: 'Power snatch', family: 'snatches', category: 'lift', unit: 'kg' },
  { id: 'hang-squat-snatch', name: 'Hang squat snatch', family: 'snatches', category: 'lift', unit: 'kg' },
  { id: 'hang-power-snatch', name: 'Hang power snatch', family: 'snatches', category: 'lift', unit: 'kg' },
  { id: 'muscle-snatch', name: 'Muscle snatch', family: 'snatches', category: 'lift', unit: 'kg' },
  // Lift — Deadlifts
  { id: 'deadlift', name: 'Deadlift', family: 'deadlifts', category: 'lift', unit: 'kg' },
  { id: 'sumo-deadlift', name: 'Sumo deadlift', family: 'deadlifts', category: 'lift', unit: 'kg' },
  { id: 'snatch-grip-deadlift', name: 'Snatch grip deadlift', family: 'deadlifts', category: 'lift', unit: 'kg' },
  // Lift — Olympic
  { id: 'clean-and-jerk', name: 'Clean and jerk', family: 'olympic', category: 'lift', unit: 'kg' },
  { id: 'power-clean-and-jerk', name: 'Power clean and jerk', family: 'olympic', category: 'lift', unit: 'kg' },
  // Gym — Pull-ups (max reps)
  { id: 'strict-pullup', name: 'Strict pull-up', family: 'pull', category: 'gym', unit: 'reps' },
  { id: 'kipping-pullup', name: 'Kipping pull-up', family: 'pull', category: 'gym', unit: 'reps' },
  { id: 'butterfly-pullup', name: 'Butterfly pull-up', family: 'pull', category: 'gym', unit: 'reps' },
  { id: 'chest-to-bar', name: 'Strict chest to bar', family: 'pull', category: 'gym', unit: 'reps' },
  { id: 'kipping-chest-to-bar', name: 'Kipping chest to bar', family: 'pull', category: 'gym', unit: 'reps' },
  { id: 'butterfly-chest-to-bar', name: 'Butterfly chest to bar', family: 'pull', category: 'gym', unit: 'reps' },
  // Gym — Toes to bar
  { id: 'toes-to-bar', name: 'Toes to bar', family: 'ttb', category: 'gym', unit: 'reps' },
  // Gym — Dips
  { id: 'bar-dips', name: 'Bar dips', family: 'dips', category: 'gym', unit: 'reps' },
  { id: 'ring-dips', name: 'Ring dips', family: 'dips', category: 'gym', unit: 'reps' },
  // Gym — HSPU / Handstand
  { id: 'strict-hspu', name: 'Strict HSPU', family: 'hs', category: 'gym', unit: 'reps' },
  { id: 'kipping-hspu', name: 'Kipping HSPU', family: 'hs', category: 'gym', unit: 'reps' },
  { id: 'hswalk', name: 'Handstand walk', family: 'hs', category: 'gym', unit: 'm' },
  // Gym — Muscle-up
  { id: 'bar-mu', name: 'Bar muscle-up', family: 'muscle', category: 'gym', unit: 'reps' },
  { id: 'ring-mu', name: 'Ring muscle-up', family: 'muscle', category: 'gym', unit: 'reps' },
  // Gym — Legs
  { id: 'pistols', name: 'Pistols', family: 'legs', category: 'gym', unit: 'reps' },
  // Gym — Weighted (1 RM)
  { id: 'weighted-pullup', name: 'Weighted pull-up', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-chest-to-bar', name: 'Weighted chest to bar', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-dips', name: 'Weighted dips', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-bar-mu', name: 'Weighted muscle-up', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-ring-mu', name: 'Weighted ring muscle-up', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-strict-hspu', name: 'Weighted strict HSPU', family: 'weighted', category: 'gym', unit: 'kg' },
  { id: 'weighted-kipping-hspu', name: 'Weighted kipping HSPU', family: 'weighted', category: 'gym', unit: 'kg' },
  // Cardio stubs
  { id: 'run-400', name: '400 m', family: 'run', category: 'cardio', unit: 's' },
  { id: 'run-1600', name: '1600 m', family: 'run', category: 'cardio', unit: 's' },
  { id: 'row-500', name: '500 m row', family: 'row', category: 'cardio', unit: 's' },
  { id: 'row-2000', name: '2000 m row', family: 'row', category: 'cardio', unit: 's' },
  { id: 'bike-cal', name: '50 cal bike', family: 'bike', category: 'cardio', unit: 's' },
  // Benchmarks stubs
  { id: 'fran', name: 'Fran', family: 'girls', category: 'benchmarks', unit: 's' },
  { id: 'grace', name: 'Grace', family: 'girls', category: 'benchmarks', unit: 's' },
  { id: 'murph', name: 'Murph', family: 'heroes', category: 'benchmarks', unit: 's' },
];

export interface PrEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  value: number;
  note?: string;
  isPr?: boolean;
}

/** Ligne telle que renvoyée par personal_records. */
export interface PersonalRecord {
  id: string;
  movement_id: string;
  value: number;
  note: string;
  performed_on: string;
  created_at: string;
}

export function getMovement(id: string): PrMovement | undefined {
  return PR_MOVEMENTS.find((m) => m.id === id);
}

/** Temps : le plus bas gagne. Le reste : le plus haut. À égalité, la date la plus récente. */
function beats(unit: PrUnit, row: PersonalRecord, champ: PersonalRecord): boolean {
  if (row.value !== champ.value) return unit === 's' ? row.value < champ.value : row.value > champ.value;
  if (row.performed_on !== champ.performed_on) return row.performed_on > champ.performed_on;
  return row.created_at > champ.created_at;
}

export function bestRecord(rows: PersonalRecord[], unit: PrUnit): PersonalRecord | undefined {
  return rows.reduce<PersonalRecord | undefined>((champ, row) => (!champ || beats(unit, row, champ) ? row : champ), undefined);
}

/** Historique du plus récent au plus ancien, avec le badge sur la meilleure perf. */
export function entriesFor(rows: PersonalRecord[], unit: PrUnit): PrEntry[] {
  const best = bestRecord(rows, unit);
  return [...rows]
    .sort((a, b) => b.performed_on.localeCompare(a.performed_on) || b.created_at.localeCompare(a.created_at))
    .map((row) => ({
      id: row.id,
      date: row.performed_on,
      value: row.value,
      note: row.note,
      isPr: row.id === best?.id,
    }));
}

/** null si la saisie est vide ou ne correspond pas à l'unité. */
export function parsePrValue(raw: string, unit: PrUnit): number | null {
  const text = raw.trim().replace(',', '.');
  if (!text) return null;
  const ok = (n: number) => (n > 0 && n <= 100000 ? n : null);
  if (unit === 's') {
    const clock = text.match(/^(\d+):([0-5]\d)$/);
    if (clock) return ok(Number(clock[1]) * 60 + Number(clock[2]));
    if (!/^\d+$/.test(text)) return null;
    return ok(Number(text));
  }
  if (unit === 'reps') {
    if (!/^\d+$/.test(text)) return null;
    return ok(Number(text));
  }
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  return ok(Number(text));
}

export function historyTitle(unit: PrUnit): string {
  if (unit === 'kg') return 'Historique · 1 RM';
  if (unit === 'reps') return 'Historique · max';
  if (unit === 'm') return 'Historique · distance';
  return 'Historique · temps';
}

export function formatPrDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Classic % of 1RM for the Pourcentages tab. */
export const PR_PERCENTAGES = [110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 40, 30, 20] as const;

export function familiesForCategory(category: PrCategory): PrFamily[] {
  return PR_FAMILIES.filter((f) => f.category === category);
}

export function listTitleForCategory(category: PrCategory): string {
  if (category === 'lift') return 'Mes records · 1 RM';
  if (category === 'gym') return 'Mes records · max / 1 RM';
  if (category === 'cardio') return 'Mes records · temps';
  return 'Mes records · benchmarks';
}

export function formatPrValue(value: number, unit: PrUnit): string {
  if (unit === 'kg') return `${value} kg`;
  if (unit === 'reps') return `${value} reps`;
  if (unit === 'm') return `${value} m`;
  // seconds → mm:ss
  const m = Math.floor(value / 60);
  const s = value % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Valeur prête à réinjecter dans le champ de saisie. */
export function formatPrInput(value: number, unit: PrUnit): string {
  if (unit === 's') {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return String(value);
}

export function filterMovements(
  category: PrCategory,
  familyId: PrFamilyId | 'all',
  query: string,
): PrMovement[] {
  const q = query.trim().toLowerCase();
  return PR_MOVEMENTS.filter((m) => {
    if (m.category !== category) return false;
    if (familyId !== 'all' && m.family !== familyId) return false;
    if (q && !m.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function groupByFamily(movements: PrMovement[]): { family: PrFamily; items: PrMovement[] }[] {
  const order = PR_FAMILIES.map((f) => f.id);
  const map = new Map<PrFamilyId, PrMovement[]>();
  for (const m of movements) {
    const list = map.get(m.family) ?? [];
    list.push(m);
    map.set(m.family, list);
  }
  return order
    .filter((id) => map.has(id))
    .map((id) => ({
      family: PR_FAMILIES.find((f) => f.id === id)!,
      items: map.get(id)!,
    }));
}
