import { PR_MOVEMENTS, type PrMovement, type PrUnit } from '@/lib/records';

/** Paliers reps (gym bodyweight). */
export const BADGE_TIERS_REPS = [1, 5, 10, 15] as const;
/** Alias historique. */
export const BADGE_TIERS = BADGE_TIERS_REPS;

export interface BadgeDef {
  /** Same as PR movement id. */
  id: string;
  movementId: string;
  name: string;
  tagline: string;
  requirement: string;
  unit: PrUnit;
  tiers: readonly number[];
}

const TAGLINES: Record<string, string> = {
  'strict-pullup': 'La base de la barre, sans élan.',
  'kipping-pullup': 'Le rythme de la barre.',
  'butterfly-pullup': 'Le cycle fluide.',
  'chest-to-bar': 'La poitrine touche la barre.',
  'kipping-chest-to-bar': 'Chest-to-bar en kipping.',
  'butterfly-chest-to-bar': 'Chest-to-bar en butterfly.',
  'toes-to-bar': 'Orteils qui touchent la barre.',
  'bar-dips': 'Dips à la barre.',
  'ring-dips': 'Dips aux anneaux.',
  'strict-hspu': 'Force et équilibre à l’envers.',
  'kipping-hspu': 'HSPU en kipping.',
  hswalk: 'Marcher sur les mains.',
  'bar-mu': 'Passer au-dessus de la barre.',
  'ring-mu': 'Ton premier passage au-dessus des anneaux.',
  pistols: 'Squat sur une jambe.',
  fran: 'Le benchmark mythique thrusters + pull-ups.',
  grace: '30 clean & jerk chronométrés.',
  murph: 'Le hero WOD ultime.',
};

const REQUIREMENTS: Record<string, string> = {
  'strict-pullup': 'Réaliser des pull-ups stricts complets, menton au-dessus de la barre, sans kipping.',
  'kipping-pullup': 'Enchaîner des kipping pull-ups avec amplitude complète.',
  'butterfly-pullup': 'Enchaîner des butterfly pull-ups fluides.',
  'chest-to-bar': 'Pull-ups stricts où la poitrine touche clairement la barre.',
  'kipping-chest-to-bar': 'Chest-to-bar en kipping, poitrine qui touche la barre.',
  'butterfly-chest-to-bar': 'Chest-to-bar en butterfly.',
  'toes-to-bar': 'Toes-to-bar : pieds qui touchent clairement la barre.',
  'bar-dips': 'Dips à la barre, épaules sous les coudes en bas.',
  'ring-dips': 'Dips aux anneaux, épaules sous les coudes en bas.',
  'strict-hspu': 'HSPU strict contre le mur, tête au sol puis bras tendus.',
  'kipping-hspu': 'HSPU en kipping, amplitude complète.',
  hswalk: 'Parcourir la distance en handstand walk sans chute.',
  'bar-mu': 'Bar muscle-up complet, du hang au support bras tendus.',
  'ring-mu': 'Ring muscle-up complet, sans assistance.',
  pistols: 'Pistol squat complet de chaque côté, sans aide des mains au sol.',
};

/** Paliers temps (secondes) — du plus accessible au plus exigeant. */
const TIME_TIERS: Record<string, readonly number[]> = {
  'run-400': [90, 75, 65, 55],
  'run-1600': [480, 420, 360, 300],
  'row-500': [120, 105, 95, 85],
  'row-2000': [540, 480, 450, 420],
  'bike-cal': [180, 150, 130, 110],
  fran: [300, 240, 200, 150],
  grace: [180, 150, 120, 90],
  murph: [3600, 3000, 2700, 2400],
};

export function tiersForMovement(m: PrMovement): readonly number[] {
  if (m.unit === 'reps') return BADGE_TIERS_REPS;
  if (m.unit === 'm') return [5, 10, 15, 25];
  if (m.unit === 'kg') {
    if (m.family === 'weighted') return [10, 20, 30, 40];
    return [40, 60, 80, 100];
  }
  return TIME_TIERS[m.id] ?? [300, 240, 180, 120];
}

function fromMovement(m: PrMovement): BadgeDef {
  const tiers = tiersForMovement(m);
  const unitHint =
    m.unit === 'reps'
      ? 'reps'
      : m.unit === 'kg'
        ? 'kg'
        : m.unit === 'm'
          ? 'mètres'
          : 'temps';
  return {
    id: m.id,
    movementId: m.id,
    name: m.name,
    unit: m.unit,
    tagline: TAGLINES[m.id] ?? `Progresse sur ${m.name}.`,
    requirement:
      REQUIREMENTS[m.id] ??
      (m.unit === 's'
        ? `Améliore ton temps sur ${m.name} pour franchir les paliers.`
        : `Atteins les paliers (${unitHint}) sur ${m.name}.`),
    tiers,
  };
}

/** Tous les mouvements PR → un badge chacun. */
export const BADGES: BadgeDef[] = PR_MOVEMENTS.map(fromMovement);

/** @deprecated utilise BADGES */
export const GYM_REP_BADGES = BADGES;

export function allBadges(): BadgeDef[] {
  return BADGES;
}

/** @deprecated utilise allBadges */
export function gymRepBadges(): BadgeDef[] {
  return BADGES;
}

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

export function badgeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const TIER_ROMAN = ['I', 'II', 'III', 'IV'] as const;

export function higherIsBetter(unit: PrUnit): boolean {
  return unit !== 's';
}
