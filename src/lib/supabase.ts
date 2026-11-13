import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key);

export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key', {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** Message d'erreur lisible depuis une erreur Supabase/Postgres. */
export function errMsg(e: unknown): string {
  if (!e) return 'Erreur inconnue';
  if (typeof e === 'string') return e;
  const m = (e as { message?: string }).message || 'Erreur inconnue';
  if (/duplicate key|23505/.test(m)) return 'Cette valeur est déjà utilisée';
  if (/Invalid login credentials/.test(m)) return 'E-mail ou mot de passe incorrect';
  if (/Email not confirmed/.test(m)) return 'Adresse e-mail pas encore confirmée : ouvre le lien reçu par e-mail.';
  if (/User already registered/.test(m)) return 'Un compte existe déjà avec cet e-mail';
  if (/Password should be at least/.test(m)) return 'Mot de passe trop court';
  if (/should be different from the old password/.test(m)) return 'Choisis un mot de passe différent de l’ancien';
  if (/rate limit|only request this after/i.test(m)) return 'Trop de demandes : réessaie dans quelques minutes';
  if (/Network request failed|Failed to fetch/.test(m)) return 'Connexion impossible, vérifie ton réseau';
  if (/row-level security/.test(m)) return 'Action non autorisée';
  return m;
}
