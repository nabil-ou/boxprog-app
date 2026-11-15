/**
 * Thème marque blanche : chaque box fournit une couleur principale (barres, fonds de marque)
 * et une couleur d'accent (boutons d'action, repères). Neutres et échelle typo sont fixes.
 */
import { BRAND_FALLBACK } from '@/config/box';
import { KIND_COLORS, type BlockKind, type KindColors } from '@/lib/types';

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Texte lisible (blanc ou quasi-noir) sur un fond donné. */
export function onColor(bg: string): string {
  return contrast(bg, '#FFFFFF') >= contrast(bg, '#111111') ? '#FFFFFF' : '#111111';
}

export function isHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

/** Mélange `hex` avec `other` ; t = part de `other` (0 → hex, 1 → other). */
export function mix(hex: string, other: string, t: number): string {
  const a = rgb(hex),
    b = rgb(other);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Teinte un hex vers le blanc (amount 0 → hex, 1 → blanc). */
export function tint(hex: string, amount: number): string {
  if (!isHex(hex)) return '#F0F0F1';
  return mix(hex, '#FFFFFF', amount);
}

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  sheet: 20,
} as const;

export const type = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
};

export const font = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
} as const;

export interface Palette {
  primary: string;
  onPrimary: string;
  /** Texte secondaire sur la couleur principale. */
  onPrimaryMuted: string;
  accent: string;
  onAccent: string;
  /** Couleur principale assez foncée pour un texte ou un lien sur fond blanc. */
  ink: string;
  background: string;
  surface: string;
  raised: string;
  text: string;
  secondary: string;
  muted: string;
  border: string;
  danger: string;
}

/** Couleur d’un type de bloc : custom box si définie, sinon défaut Boxprog. */
export function kindColor(kind: BlockKind, custom?: KindColors | null): string {
  const c = custom?.[kind];
  return c && isHex(c) ? c : KIND_COLORS[kind] ?? '#475569';
}

export function makePalette(primary = BRAND_FALLBACK.primary, accent = BRAND_FALLBACK.accent): Palette {
  const p = isHex(primary) ? primary : BRAND_FALLBACK.primary;
  const a = isHex(accent) ? accent : BRAND_FALLBACK.accent;
  const onPrimary = onColor(p);
  let ink = p;
  while (contrast(ink, '#FFFFFF') < 4.5) ink = mix(ink, '#000000', 0.15);
  const text = '#171717';
  return {
    primary: p,
    onPrimary,
    onPrimaryMuted: mix(onPrimary, p, 0.4),
    accent: a,
    onAccent: onColor(a),
    ink,
    background: '#F5F5F6',
    surface: '#FFFFFF',
    raised: '#F0F0F1',
    text,
    secondary: '#525252',
    muted: '#737373',
    border: mix(text, '#FFFFFF', 0.9),
    danger: '#B91C1C',
  };
}
