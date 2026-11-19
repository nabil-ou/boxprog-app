import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { loadPublishedCommunications } from '@/lib/communications';
import { errMsg } from '@/lib/supabase';
import type { Communication } from '@/lib/types';

/** Communications publiées de la box, rechargées à chaque focus de l’écran. */
export function useCommunications(boxId: string) {
  const [items, setItems] = useState<Communication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await loadPublishedCommunications(boxId));
      setError(null);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [boxId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return { items, error, reload: load };
}
