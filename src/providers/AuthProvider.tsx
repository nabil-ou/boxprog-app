import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { errMsg, supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  /** Ouvert depuis un lien « mot de passe oublié » : il faut choisir un nouveau mot de passe. */
  recovering: boolean;
  finishRecovery: () => void;
  /** Lien d'e-mail expiré ou invalide. */
  linkError: string | null;
  clearLinkError: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth hors AuthProvider');
  return ctx;
}

/** Paramètres d'un lien Supabase : le fragment (#access_token=…) et la query (?error=…). */
function linkParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  for (const part of `${query}&${hash}`.split('&')) {
    const [k, v = ''] = part.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return out;
}

type LinkResult = { recovery: boolean } | { error: string } | null;

/** Ouvre la session portée par un lien d'e-mail (confirmation ou réinitialisation). */
async function openAuthLink(url: string): Promise<LinkResult> {
  const p = linkParams(url);
  if (p.error_description || p.error) {
    return { error: p.error_code === 'otp_expired' ? 'Ce lien a expiré. Demande-en un nouveau.' : p.error_description || p.error };
  }
  if (!p.access_token || !p.refresh_token) return null;
  const { error } = await supabase.auth.setSession({ access_token: p.access_token, refresh_token: p.refresh_token });
  if (error) return { error: errMsg(error) };
  return { recovery: p.type === 'recovery' };
}

/** Adresse de retour dans l'app pour les liens envoyés par e-mail. */
export const authRedirect = (path: string) => Linking.createURL(path);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const handled = useRef(new Set<string>());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // useLinkingURL ne reçoit pas les liens exp:// dans Expo Go : on écoute l'API Linking comme Expo Router.
    const handle = (url: string | null) => {
      if (!url || handled.current.has(url)) return;
      handled.current.add(url);
      openAuthLink(url).then((res) => {
        if (!res) return;
        setLinkError('error' in res ? res.error : null);
        if ('recovery' in res && res.recovery) setRecovering(true);
      });
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, []);

  const signOut = async () => {
    setRecovering(false);
    const { error } = await supabase.auth.signOut();
    // Hors ligne, la déconnexion serveur échoue : on oublie quand même la session locale.
    if (error) await supabase.auth.signOut({ scope: 'local' });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        recovering,
        finishRecovery: () => setRecovering(false),
        linkError,
        clearLinkError: () => setLinkError(null),
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
