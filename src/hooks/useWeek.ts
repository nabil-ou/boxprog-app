import { useCallback, useEffect, useState } from 'react';

import { addDays } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type { Block, WorkoutDay } from '@/lib/types';

/** Jours (+ blocs) d'une semaine pour une piste. La RLS ne renvoie que le publié. */
export function useWeek(boxId: string, monday: string, trackId: string | null) {
  const [days, setDays] = useState<WorkoutDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!trackId) {
      setDays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_days')
      .select('id, box_id, day, publish_at, blocks(*)')
      .eq('box_id', boxId)
      .eq('track_id', trackId)
      .gte('day', monday)
      .lte('day', addDays(monday, 6))
      .order('day')
      .order('position', { referencedTable: 'blocks' });
    if (error) {
      setError(error.message);
      setDays(null);
      setLoading(false);
      return;
    }
    setError(null);
    setDays(
      (data as WorkoutDay[]).map((d) => ({
        ...d,
        blocks: [...(d.blocks || [])].sort((a: Block, b: Block) => a.position - b.position),
      })),
    );
    setLoading(false);
  }, [boxId, monday, trackId]);

  useEffect(() => {
    setDays(null);
    load();
  }, [load]);

  return { days, error, loading, reload: load };
}
