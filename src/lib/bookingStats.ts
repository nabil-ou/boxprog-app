import { iso, monthTitle } from '@/lib/dates';
import { supabase } from '@/lib/supabase';

/** Prochain palier d'assiduité de la box, au-dessus du total de l'adhérent. */
export type NextReward = {
  threshold: number;
  title: string;
  reward: string;
  remaining: number;
};

/** Séance faite = réservation confirmée dont l'heure de début est passée (fuseau de la box). */
export type SessionStats = {
  total: number;
  month: number;
  upcoming: number;
  monthRank: number | null;
  /** Première séance de la box (YYYY-MM-DD), null si aucune. */
  since: string | null;
  next: NextReward | null;
};

/** null : pas encore atteint · pending : récompense à récupérer à la box · already : atteint avant la création du palier. */
export type RewardStatus = 'delivered' | 'pending' | 'already' | 'reached' | null;

export type RewardEntry = {
  threshold: number;
  title: string;
  reward: string;
  reachedOn: string | null;
  status: RewardStatus;
};

export type RankEntry = {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  sessions: number;
  isMe: boolean;
};

/** month : 1 = janvier … 12 = décembre */
export type RankPeriod =
  | { kind: 'month'; year: number; month: number }
  | { kind: 'year'; year: number }
  | { kind: 'all' };

export function monthRange(year: number, month: number): { from: string; to: string } {
  return { from: iso(new Date(year, month - 1, 1)), to: iso(new Date(year, month, 0)) };
}

function periodRange(period: RankPeriod): { from: string; to: string } | null {
  if (period.kind === 'month') return monthRange(period.year, period.month);
  if (period.kind === 'year') return { from: `${period.year}-01-01`, to: `${period.year}-12-31` };
  return null;
}

/** Mois du mois en cours jusqu'à celui de `since`, du plus récent au plus ancien. */
export function monthOptions(since: string | null, today = new Date()): { year: number; month: number; label: string }[] {
  const last = today.getFullYear() * 12 + today.getMonth();
  const first = since ? Math.min(last, Number(since.slice(0, 4)) * 12 + Number(since.slice(5, 7)) - 1) : last;
  const out: { year: number; month: number; label: string }[] = [];
  for (let k = last; k >= first; k--) {
    const year = Math.floor(k / 12);
    const month = (k % 12) + 1;
    out.push({ year, month, label: monthTitle(monthRange(year, month).from) });
  }
  return out;
}

/** Années de l'année en cours jusqu'à celle de `since`. */
export function yearOptions(since: string | null, today = new Date()): number[] {
  const last = today.getFullYear();
  const first = Math.min(last, since ? Number(since.slice(0, 4)) : last);
  return Array.from({ length: last - first + 1 }, (_, i) => last - i);
}

export function podiumTitle(period: RankPeriod): string {
  if (period.kind === 'month') return 'Podium du mois';
  if (period.kind === 'year') return 'Podium de l’année';
  return 'Podium de tous les temps';
}

export const sessionsLabel = (n: number) => `${n} séance${n > 1 ? 's' : ''}`;

/** 1er, 2e, 3e… */
export const rankLabel = (n: number) => (n === 1 ? '1er' : `${n}e`);

/** Nom d'un palier : son titre, sinon « 100 séances ». */
export const rewardName = (r: { threshold: number; title: string }) => r.title || sessionsLabel(r.threshold);

type StatsRow = {
  total: number;
  month: number;
  upcoming: number;
  month_rank: number | null;
  since: string | null;
  next_threshold?: number | null;
  next_title?: string | null;
  next_reward?: string | null;
};

type RewardRow = {
  threshold: number;
  title: string | null;
  reward: string | null;
  reached_on: string | null;
  status: RewardStatus;
};

type RankRow = {
  rank: number;
  display_name: string | null;
  avatar_url: string | null;
  sessions: number;
  is_me: boolean;
};

export async function loadSessionStats(boxId: string): Promise<SessionStats> {
  const { data, error } = await supabase.rpc('my_session_stats', { p_box: boxId });
  if (error) throw error;
  const r = ((data || []) as StatsRow[])[0];
  const total = Number(r?.total) || 0;
  const threshold = r?.next_threshold == null ? null : Number(r.next_threshold);
  return {
    total,
    month: Number(r?.month) || 0,
    upcoming: Number(r?.upcoming) || 0,
    monthRank: r?.month_rank == null ? null : Number(r.month_rank),
    since: r?.since ? String(r.since).slice(0, 10) : null,
    next: threshold
      ? { threshold, title: r?.next_title?.trim() || '', reward: r?.next_reward?.trim() || '', remaining: threshold - total }
      : null,
  };
}

/** Paliers de la box, avec l'état pour l'adhérent connecté. */
export async function loadRewards(boxId: string): Promise<RewardEntry[]> {
  const { data, error } = await supabase.rpc('my_rewards', { p_box: boxId });
  if (error) throw error;
  return ((data || []) as RewardRow[]).map((r) => ({
    threshold: Number(r.threshold) || 0,
    title: r.title?.trim() || '',
    reward: r.reward?.trim() || '',
    reachedOn: r.reached_on ? String(r.reached_on).slice(0, 10) : null,
    status: r.status ?? null,
  }));
}

export async function loadRanks(boxId: string, period: RankPeriod): Promise<RankEntry[]> {
  const range = periodRange(period);
  const { data, error } = await supabase.rpc('booking_ranks', {
    p_box: boxId,
    p_from: range?.from ?? null,
    p_to: range?.to ?? null,
  });
  if (error) throw error;
  return ((data || []) as RankRow[]).map((r) => ({
    rank: Number(r.rank) || 0,
    displayName: r.display_name?.trim() || 'Adhérent',
    avatarUrl: r.avatar_url,
    sessions: Number(r.sessions) || 0,
    isMe: Boolean(r.is_me),
  }));
}
