import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { BOX_SLUG } from '@/config/box';
import { errMsg, supabase } from '@/lib/supabase';
import { makePalette, type Palette } from '@/lib/theme';
import type { BoxPublic } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Où en est l'utilisateur avec la box de l'app :
 * join = connecté mais pas encore membre ; unavailable = box introuvable, suspendue ou impayée ;
 * error = box_public n'a pas répondu.
 */
export type Access = 'loading' | 'signedOut' | 'join' | 'pending' | 'blocked' | 'unavailable' | 'error' | 'active';

interface BoxState {
  box: BoxPublic | null;
  access: Access;
  error: string | null;
  reload: () => Promise<void>;
}

const BoxContext = createContext<BoxState | null>(null);

export function useBox() {
  const ctx = useContext(BoxContext);
  if (!ctx) throw new Error('useBox hors BoxProvider');
  return ctx;
}

/** Box chargée : à utiliser dans les écrans réservés aux membres actifs. */
export function useActiveBox(): BoxPublic {
  const { box } = useBox();
  if (!box) throw new Error('useActiveBox sans box chargée');
  return box;
}

export function useBrand(): Palette {
  const { box } = useBox();
  return useMemo(() => makePalette(box?.primary_color, box?.accent_color), [box?.primary_color, box?.accent_color]);
}

const fetchBox = () => supabase.rpc('box_public', { p_slug: BOX_SLUG });

export function BoxProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const viewer = session?.user.id ?? 'anon';
  const [box, setBox] = useState<BoxPublic | null>(null);
  /** Utilisateur pour qui box_public a été chargé : my_status dépend de lui. */
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((res: Awaited<ReturnType<typeof fetchBox>>, forViewer: string) => {
    setError(res.error ? errMsg(res.error) : null);
    if (!res.error) setBox((res.data as BoxPublic | null) ?? null);
    setLoadedFor(forViewer);
  }, []);

  const reload = useCallback(async () => apply(await fetchBox(), viewer), [apply, viewer]);

  useEffect(() => {
    if (authLoading) return;
    let alive = true;
    fetchBox().then((res) => {
      if (alive) apply(res, viewer);
    });
    return () => {
      alive = false;
    };
  }, [authLoading, viewer, apply]);

  const access: Access = (() => {
    if (authLoading || loadedFor !== viewer) return 'loading';
    if (!session) return 'signedOut';
    if (error && !box) return 'error';
    if (!box || box.status === 'suspended' || box.status === 'unpaid') return 'unavailable';
    if (!box.my_status) return 'join';
    return box.my_status;
  })();

  return <BoxContext.Provider value={{ box, access, error, reload }}>{children}</BoxContext.Provider>;
}
