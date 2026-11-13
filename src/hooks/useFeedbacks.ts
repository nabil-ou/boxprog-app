import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Feedback } from '@/lib/types';

export interface FeedbackSummary {
  count: Map<string, number>;
  mine: Map<string, Feedback>;
}

/** Retours par bloc (RLS : l’adhérent ne voit que les siens). */
export function useFeedbacks(blockIds: string[]) {
  const [summary, setSummary] = useState<FeedbackSummary>({ count: new Map(), mine: new Map() });
  const key = blockIds.join(',');

  const load = useCallback(async () => {
    if (!key) {
      setSummary({ count: new Map(), mine: new Map() });
      return;
    }
    const [{ data: s }, { data }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('feedbacks').select('id, block_id, user_id, body, created_at, updated_at').in('block_id', key.split(',')),
    ]);
    const me = s.session?.user.id;
    const count = new Map<string, number>();
    const mine = new Map<string, Feedback>();
    for (const f of (data || []) as Feedback[]) {
      count.set(f.block_id, (count.get(f.block_id) || 0) + 1);
      if (f.user_id === me) mine.set(f.block_id, f);
    }
    setSummary({ count, mine });
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...summary, reload: load };
}
