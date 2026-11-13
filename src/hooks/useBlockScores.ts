import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Block, ScoreRow } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';

/** Scores d’un bloc + encouragements. */
export function useBlockScores(block: Block, boxId: string) {
  const { session } = useAuth();
  const me = session!.user.id;
  const [rows, setRows] = useState<ScoreRow[] | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('scores')
      .select('id, block_id, user_id, level, value, membership:memberships(display_name, sex), bumps(user_id)')
      .eq('block_id', block.id);
    setRows((data as unknown as ScoreRow[]) || []);
  }, [block.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel('lb-' + block.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores', filter: `block_id=eq.${block.id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bumps', filter: `box_id=eq.${boxId}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [block.id, boxId, load]);

  const toggleBump = async (r: ScoreRow) => {
    const has = r.bumps.some((x) => x.user_id === me);
    setRows((rs) =>
      rs!.map((x) =>
        x.id !== r.id
          ? x
          : { ...x, bumps: has ? x.bumps.filter((y) => y.user_id !== me) : [...x.bumps, { user_id: me }] },
      ),
    );
    const { error } = await (has
      ? supabase.from('bumps').delete().eq('score_id', r.id).eq('user_id', me)
      : supabase.from('bumps').insert({ score_id: r.id, user_id: me }));
    if (error) load();
  };

  return { rows, me, mine: rows?.find((r) => r.user_id === me), load, toggleBump };
}
