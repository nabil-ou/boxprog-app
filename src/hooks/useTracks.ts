import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Track } from '@/lib/types';

/** Pistes publiques de la box (WOD, Haltéro, Hyrox…), sans les programmes perso. */
export function useTracks(boxId: string) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, name, color, is_default, position, member_id, cycle_mode')
      .eq('box_id', boxId)
      .is('member_id', null)
      .order('position')
      .order('name');
    if (error) {
      setError(error.message);
      setTracks(null);
      return;
    }
    setError(null);
    setTracks(data as Track[]);
  }, [boxId]);

  useEffect(() => {
    setTracks(null);
    load();
  }, [load]);

  return { tracks, error, reload: load };
}

const trackKey = (boxId: string) => `boxprog.track.${boxId}`;

export function readStoredTrackId(boxId: string): string | null {
  try {
    return localStorage.getItem(trackKey(boxId));
  } catch {
    return null;
  }
}

export function storeTrackId(boxId: string, trackId: string) {
  try {
    localStorage.setItem(trackKey(boxId), trackId);
  } catch {
    /* ignore */
  }
}
