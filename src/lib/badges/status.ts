import { allBadges, higherIsBetter, type BadgeDef } from '@/lib/badges/catalog';
import { formatPrValue, type PersonalRecord, type PrUnit } from '@/lib/records';

export type BadgeFilter = 'unlocked' | 'locked';

export interface BadgeStatus {
  best: number;
  /** -1 locked, 0..n highest unlocked tier index. */
  tierIndex: number;
  nextTarget: number | null;
  /** 0–100 toward nextTarget (from previous tier floor). */
  progressToNext: number;
  /** Date of the PR that holds the best (ISO), if any. */
  bestAt: string | null;
}

export type BadgeWithStatus = BadgeDef & BadgeStatus;

export function statusFromBest(
  best: number,
  tiers: readonly number[],
  unit: PrUnit,
  bestAt: string | null = null,
): BadgeStatus {
  const value = best > 0 ? best : 0;
  if (!value || tiers.length === 0) {
    return {
      best: 0,
      tierIndex: -1,
      nextTarget: tiers[0] ?? null,
      progressToNext: 0,
      bestAt: null,
    };
  }

  const better = higherIsBetter(unit);
  let tierIndex = -1;
  for (let i = 0; i < tiers.length; i++) {
    const unlocked = better ? value >= tiers[i] : value <= tiers[i];
    if (unlocked) tierIndex = i;
    else break;
  }

  if (tierIndex >= tiers.length - 1) {
    return { best: value, tierIndex, nextTarget: null, progressToNext: 100, bestAt };
  }

  const nextTarget = tiers[tierIndex + 1];
  if (better) {
    const prevFloor = tierIndex >= 0 ? tiers[tierIndex] : 0;
    const span = nextTarget - prevFloor;
    const progressToNext =
      span <= 0 ? 0 : Math.min(100, Math.round(((value - prevFloor) / span) * 100));
    return { best: value, tierIndex, nextTarget, progressToNext, bestAt };
  }

  // Temps : plus bas = mieux. prevFloor = palier actuel (plus lent), next = plus rapide.
  const prevFloor = tierIndex >= 0 ? tiers[tierIndex] : nextTarget + (tiers[0] - (tiers[1] ?? tiers[0] * 0.8));
  const span = prevFloor - nextTarget;
  const progressToNext =
    span <= 0 ? 0 : Math.min(100, Math.max(0, Math.round(((prevFloor - value) / span) * 100)));
  return { best: value, tierIndex, nextTarget, progressToNext, bestAt };
}

export interface BadgeUnlock {
  /** Highest newly unlocked tier index (0..n). */
  tierIndex: number;
  /** Target value of that tier. */
  target: number;
}

/** Returns the highest newly unlocked tier when nextBest crosses a palier, else null. */
export function unlockFromPr(
  previousBest: number,
  nextBest: number,
  tiers: readonly number[],
  unit: PrUnit,
): BadgeUnlock | null {
  const prev = statusFromBest(previousBest, tiers, unit).tierIndex;
  const next = statusFromBest(nextBest, tiers, unit).tierIndex;
  if (next <= prev || next < 0) return null;
  return { tierIndex: next, target: tiers[next] };
}

/** Best value + date of that PR for a movement. */
export function bestForMovement(
  rows: PersonalRecord[] | null,
  movementId: string,
  bestByMovement: Record<string, number>,
): { best: number; bestAt: string | null } {
  const best = bestByMovement[movementId] ?? 0;
  if (!best || !rows) return { best: 0, bestAt: null };
  const match = rows
    .filter((r) => r.movement_id === movementId && r.value === best)
    .sort((a, b) => (a.performed_on < b.performed_on ? 1 : -1))[0];
  return { best, bestAt: match?.performed_on ?? match?.created_at ?? null };
}

/** @deprecated */
export const bestRepForMovement = bestForMovement;

export function allWithStatus(
  bestByMovement: Record<string, number>,
  rows: PersonalRecord[] | null,
): BadgeWithStatus[] {
  return allBadges().map((badge) => {
    const { best, bestAt } = bestForMovement(rows, badge.movementId, bestByMovement);
    return { ...badge, ...statusFromBest(best, badge.tiers, badge.unit, bestAt) };
  });
}

export function unlockedCount(items: BadgeWithStatus[]): number {
  return items.filter((b) => b.tierIndex >= 0).length;
}

export function lockedCount(items: BadgeWithStatus[]): number {
  return items.filter((b) => b.tierIndex < 0).length;
}

export function recentUnlocked(items: BadgeWithStatus[], limit = 3): BadgeWithStatus[] {
  return items
    .filter((b) => b.tierIndex >= 0)
    .sort((a, b) => {
      const da = a.bestAt ?? '';
      const db = b.bestAt ?? '';
      if (da !== db) return db > da ? 1 : -1;
      return b.best - a.best;
    })
    .slice(0, limit);
}

/** Badges épinglés comme objectifs (non maxés), avec progression. */
export function objectives(
  items: BadgeWithStatus[],
  objectiveIds: Set<string>,
): BadgeWithStatus[] {
  return items
    .filter((b) => objectiveIds.has(b.id) && b.nextTarget != null)
    .sort((a, b) => {
      const aStarted = a.tierIndex >= 0 ? 1 : 0;
      const bStarted = b.tierIndex >= 0 ? 1 : 0;
      if (aStarted !== bStarted) return bStarted - aStarted;
      return b.progressToNext - a.progressToNext;
    });
}

export function filterBadges(items: BadgeWithStatus[], filter: BadgeFilter): BadgeWithStatus[] {
  return items.filter((b) => (filter === 'unlocked' ? b.tierIndex >= 0 : b.tierIndex < 0));
}

export function badgeById(items: BadgeWithStatus[], id: string): BadgeWithStatus | undefined {
  return items.find((b) => b.id === id);
}

export function formatBadgeProgress(best: number, nextTarget: number, unit: PrUnit): string {
  return `${formatPrValue(best, unit)} / ${formatPrValue(nextTarget, unit)}`;
}

export function formatTierLabel(target: number, unit: PrUnit): string {
  return formatPrValue(target, unit);
}

export function nextTierHint(nextTarget: number, unit: PrUnit): string {
  if (unit === 's') {
    return `Passe sous ${formatPrValue(nextTarget, unit)} pour le palier suivant.`;
  }
  if (unit === 'reps') {
    return `Atteins ${nextTarget} reps pour le palier suivant.`;
  }
  if (unit === 'm') {
    return `Atteins ${nextTarget} m pour le palier suivant.`;
  }
  return `Atteins ${formatPrValue(nextTarget, unit)} pour le palier suivant.`;
}
