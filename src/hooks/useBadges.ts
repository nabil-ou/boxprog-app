import { useMemo } from 'react';

import {
  allWithStatus,
  badgeById,
  filterBadges,
  lockedCount,
  objectives,
  recentUnlocked,
  unlockedCount,
  type BadgeFilter,
  type BadgeWithStatus,
} from '@/lib/badges';
import { useBadgeObjectives } from '@/providers/BadgeObjectivesProvider';
import { usePersonalRecords } from '@/providers/RecordsProvider';

export interface UseBadges {
  loading: boolean;
  unlocked: number;
  locked: number;
  total: number;
  recent: BadgeWithStatus[];
  goals: BadgeWithStatus[];
  list: (filter: BadgeFilter) => BadgeWithStatus[];
  get: (id: string) => BadgeWithStatus | undefined;
  all: BadgeWithStatus[];
  isObjective: (id: string) => boolean;
  setObjective: (id: string, on: boolean) => void;
}

export function useBadges(): UseBadges {
  const { rows, bestByMovement } = usePersonalRecords();
  const { objectiveIds, isObjective, setObjective } = useBadgeObjectives();

  const all = useMemo(() => allWithStatus(bestByMovement, rows), [bestByMovement, rows]);

  const unlocked = useMemo(() => unlockedCount(all), [all]);
  const locked = useMemo(() => lockedCount(all), [all]);
  const recent = useMemo(() => recentUnlocked(all, 3), [all]);
  const goals = useMemo(() => objectives(all, objectiveIds), [all, objectiveIds]);

  return {
    loading: rows === null,
    unlocked,
    locked,
    total: all.length,
    recent,
    goals,
    all,
    list: (filter: BadgeFilter) => filterBadges(all, filter),
    get: (id: string) => badgeById(all, id),
    isObjective,
    setObjective,
  };
}
