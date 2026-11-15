import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { errMsg, supabase } from '@/lib/supabase';
import { getMovement, type PersonalRecord, type PrUnit } from '@/lib/records';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox } from '@/providers/BoxProvider';

interface NewRecord {
  movementId: string;
  value: number;
  note: string;
  performedOn: string;
}

interface UpdateRecord {
  id: string;
  value: number;
  note: string;
  performedOn: string;
}

interface RecordsState {
  rows: PersonalRecord[] | null;
  error: string | null;
  /** Meilleure valeur par mouvement, pour la liste. */
  bestByMovement: Record<string, number>;
  add: (input: NewRecord) => Promise<string | null>;
  update: (input: UpdateRecord) => Promise<string | null>;
}

const RecordsContext = createContext<RecordsState | null>(null);

function asRecord(row: {
  id: string;
  movement_id: string;
  value: number | string;
  note: string | null;
  performed_on: string;
  created_at: string;
}): PersonalRecord {
  return {
    id: row.id,
    movement_id: row.movement_id,
    value: Number(row.value),
    note: row.note ?? '',
    performed_on: row.performed_on,
    created_at: row.created_at,
  };
}

export function RecordsProvider({ children }: { children: ReactNode }) {
  const box = useActiveBox();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [rows, setRows] = useState<PersonalRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data, error: err } = await supabase
      .from('personal_records')
      .select('id, movement_id, value, note, performed_on, created_at')
      .eq('box_id', box.id)
      .eq('user_id', userId)
      .order('performed_on', { ascending: false })
      .order('created_at', { ascending: false });
    if (err) {
      setError(errMsg(err));
      setRows([]);
      return;
    }
    setError(null);
    setRows(((data || []) as Parameters<typeof asRecord>[0][]).map(asRecord));
  }, [box.id, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (input: NewRecord) => {
    if (!userId) return 'Session expirée';
    const { error: err } = await supabase.from('personal_records').insert({
      box_id: box.id,
      user_id: userId,
      movement_id: input.movementId,
      value: input.value,
      note: input.note.trim(),
      performed_on: input.performedOn,
    });
    if (err) return errMsg(err);
    await load();
    return null;
  }, [box.id, userId, load]);

  const update = useCallback(async (input: UpdateRecord) => {
    if (!userId) return 'Session expirée';
    // `.select()` obligatoire : sans politique UPDATE, Supabase renvoie OK + 0 ligne.
    const { data, error: err } = await supabase
      .from('personal_records')
      .update({
        value: input.value,
        note: input.note.trim(),
        performed_on: input.performedOn,
      })
      .eq('id', input.id)
      .eq('user_id', userId)
      .select('id, movement_id, value, note, performed_on, created_at')
      .maybeSingle();
    if (err) return errMsg(err);
    if (!data) {
      return 'Modification non enregistrée (droits UPDATE manquants ou ligne introuvable)';
    }
    setRows((prev) =>
      (prev || []).map((row) => (row.id === data.id ? asRecord(data) : row)),
    );
    setError(null);
    return null;
  }, [userId]);

  const bestByMovement = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of rows || []) {
      const unit: PrUnit | undefined = getMovement(row.movement_id)?.unit;
      if (!unit) continue;
      const current = map[row.movement_id];
      if (current == null || (unit === 's' ? row.value < current : row.value > current)) map[row.movement_id] = row.value;
    }
    return map;
  }, [rows]);

  const value = useMemo(
    () => ({ rows, error, bestByMovement, add, update }),
    [rows, error, bestByMovement, add, update],
  );
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function usePersonalRecords(): RecordsState {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error('usePersonalRecords hors RecordsProvider');
  return ctx;
}
