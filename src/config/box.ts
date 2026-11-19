/** Box servie par cette app : chaque box a son propre build, configuré par l'environnement. */
export const BOX_SLUG = process.env.EXPO_PUBLIC_BOX_SLUG || 'blue-monkey-fitness';

/** Marque affichée avant que box_public réponde (et hors connexion). */
export const BRAND_FALLBACK = {
  name: 'Blue Monkey Fitness',
  primary: '#17253F',
  accent: '#CDB887',
};
