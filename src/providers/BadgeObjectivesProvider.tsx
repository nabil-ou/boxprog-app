import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadObjectiveIds, saveObjectiveIds } from '@/lib/badges/objectives';

interface BadgeObjectivesState {
  objectiveIds: Set<string>;
  isObjective: (id: string) => boolean;
  setObjective: (id: string, on: boolean) => void;
}

const BadgeObjectivesContext = createContext<BadgeObjectivesState | null>(null);

export function BadgeObjectivesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(loadObjectiveIds);

  const setObjective = useCallback((id: string, on: boolean) => {
    setIds((prev) => {
      const next = on
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id);
      saveObjectiveIds(next);
      return next;
    });
  }, []);

  const objectiveIds = useMemo(() => new Set(ids), [ids]);
  const isObjective = useCallback((id: string) => objectiveIds.has(id), [objectiveIds]);

  const value = useMemo(
    () => ({ objectiveIds, isObjective, setObjective }),
    [objectiveIds, isObjective, setObjective],
  );

  return (
    <BadgeObjectivesContext.Provider value={value}>{children}</BadgeObjectivesContext.Provider>
  );
}

export function useBadgeObjectives(): BadgeObjectivesState {
  const ctx = useContext(BadgeObjectivesContext);
  if (!ctx) throw new Error('useBadgeObjectives hors BadgeObjectivesProvider');
  return ctx;
}
