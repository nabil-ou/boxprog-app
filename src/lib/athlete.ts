import { todayIso } from '@/lib/dates';
import { errMsg, supabase } from '@/lib/supabase';

export interface Athlete {
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
}

export interface AthleteInput {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
}

export function splitName(full: string | null | undefined): { firstName: string; lastName: string } {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

export function joinName(firstName: string, lastName: string) {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function ageYears(birth: string | null, today = todayIso()): number | null {
  if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
  const [y, m, d] = birth.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

export function formatAge(age: number | null) {
  return age == null ? '—' : `${age} ans`;
}

export function formatCm(cm: number | null) {
  return cm == null || !Number.isFinite(cm) ? '—' : `${Math.round(cm)} cm`;
}

export function formatKg(kg: number | null) {
  if (kg == null || !Number.isFinite(kg)) return '—';
  const rounded = Math.round(kg * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',');
  return `${text} kg`;
}

export function weightInput(kg: number | null) {
  if (kg == null || !Number.isFinite(kg)) return '';
  const rounded = Math.round(kg * 10) / 10;
  return (Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)).replace('.', ',');
}

/** null = champ vide, 'invalid' = saisie hors limites. */
export function parseHeight(raw: string): number | null | 'invalid' {
  const t = raw.trim();
  if (!t) return null;
  if (!/^\d{2,3}$/.test(t)) return 'invalid';
  const n = Number(t);
  if (n < 100 || n > 250) return 'invalid';
  return n;
}

export function parseWeight(raw: string): number | null | 'invalid' {
  const t = raw.trim().replace(',', '.');
  if (!t) return null;
  if (!/^\d{2,3}(\.\d)?$/.test(t)) return 'invalid';
  const n = Number(t);
  if (n < 30 || n > 300) return 'invalid';
  return n;
}

const PROFILE_COLUMNS = 'full_name, avatar_url, birth_date, height_cm, weight_kg';

export async function loadAthlete(userId: string, fallbackName = ''): Promise<Athlete> {
  let { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();
  if (!error && !data) {
    const created = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: fallbackName || null })
      .select(PROFILE_COLUMNS)
      .single();
    data = created.data;
    error = created.error;
  }
  if (error || !data) throw new Error(errMsg(error));
  const fullName = (data.full_name as string | null) ?? '';
  const { firstName, lastName } = splitName(fullName);
  return {
    fullName,
    firstName,
    lastName,
    avatarUrl: (data.avatar_url as string | null) ?? null,
    birthDate: (data.birth_date as string | null) ?? null,
    heightCm: data.height_cm == null ? null : Number(data.height_cm),
    weightKg: data.weight_kg == null ? null : Number(data.weight_kg),
  };
}

export async function saveAthlete(userId: string, input: AthleteInput): Promise<string> {
  const fullName = joinName(input.firstName, input.lastName);
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      birth_date: input.birthDate,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
    })
    .eq('id', userId);
  if (error) throw new Error(errMsg(error));
  await supabase.auth.updateUser({ data: { full_name: fullName } }).catch(() => undefined);
  return fullName;
}
