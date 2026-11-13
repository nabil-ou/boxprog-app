import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface ScoreSummary {
  count: Map<string, number>;
  mine: Map<string, number>;
}

/** Nombre de scores par bloc + score de l’utilisateur courant. */
export function useScoreSummary(blockIds: string[]) {
  const [summary, setSummary] = useState<ScoreSummary>({ count: new Map(), mine: new Map() });
  const key = blockIds.join(',');

  const load = useCallback(async () => {
    if (!key) {
      setSummary({ count: new Map(), mine: new Map() });
      return;
    }
    const [{ data: s }, { data }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('scores').select('block_id, user_id, value').in('block_id', key.split(',')),
    ]);
    const me = s.session?.user.id;
    const count = new Map<string, number>();
    const mine = new Map<string, number>();
    for (const r of data || []) {
      count.set(r.block_id, (count.get(r.block_id) || 0) + 1);
      if (r.user_id === me) mine.set(r.block_id, r.value);
    }
    setSummary({ count, mine });
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...summary, reload: load };
}
