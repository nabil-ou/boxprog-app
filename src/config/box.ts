/** Box servie par cette app : chaque box a son propre build, configuré par l'environnement. */
export const BOX_SLUG = process.env.EXPO_PUBLIC_BOX_SLUG || 'cf-test';

/** Marque affichée avant que box_public réponde (et hors connexion). */
export const BRAND_FALLBACK = {
  name: 'CF Test',
  primary: '#14213D',
  accent: '#FCA311',
};
