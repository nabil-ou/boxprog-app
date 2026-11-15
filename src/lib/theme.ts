/**
 * Design system aligné SuperHote (spacing, radii, type, ombres).
 * Couleurs de marque white-label : primary / accent viennent de la box.
 */
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

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

export function onColor(bg: string): string {
  return contrast(bg, '#FFFFFF') >= contrast(bg, '#111111') ? '#FFFFFF' : '#111111';
}

export function isHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

export function mix(hex: string, other: string, t: number): string {
  const a = rgb(hex),
    b = rgb(other);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function tint(hex: string, amount: number): string {
  if (!isHex(hex)) return '#F7F7F7';
  return mix(hex, '#FFFFFF', amount);
}

/** Échelle SuperHote. */
export const Spacing = {
  XXS: 4,
  XS: 8,
  S: 12,
  M: 16,
  L: 24,
  XL: 32,
  XXL: 40,
  XXXL: 56,
} as const;

export const BorderRadius = {
  XXS: 4,
  XS: 6,
  S: 8,
  M: 12,
  L: 16,
  XL: 20,
  XXL: 24,
  XXXL: 32,
  FULL: 9999,
} as const;

export const FontSize = {
  XXS: 10,
  XS: 13,
  S: 15,
  M: 16,
  L: 20,
  XL: 24,
  XXL: 26,
  XXXL: 32,
} as const;

export const FontWeight = {
  NORMAL: '400' as const,
  MEDIUM: '500' as const,
  SEMI_BOLD: '600' as const,
  BOLD: '700' as const,
};

export const Height = {
  PRESSABLE_XS: 32,
  PRESSABLE_S: 40,
  PRESSABLE_M: 56,
  INPUT_S: 48,
  INPUT_M: 56,
} as const;

/** Ombre chrome SuperHote (boutons / icônes). */
export const softShadow: ViewStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.05,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
};

export const font = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
} as const;

export interface Palette {
  primary: string;
  onPrimary: string;
  onPrimaryMuted: string;
  accent: string;
  onAccent: string;
  ink: string;
  background: string;
  surface: string;
  /** SuperHote greyLight */
  raised: string;
  /** SuperHote neutralLight */
  neutral: string;
  text: string;
  secondary: string;
  muted: string;
  border: string;
  danger: string;
}

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
  return {
    primary: p,
    onPrimary,
    onPrimaryMuted: mix(onPrimary, p, 0.45),
    accent: a,
    onAccent: onColor(a),
    ink,
    // Neutres SuperHote light
    background: '#F7F7F7',
    surface: '#FFFFFF',
    raised: '#F7F7F7',
    neutral: '#F0F0EF',
    text: '#2C2C2B',
    secondary: '#808080',
    muted: '#808080',
    border: '#E4E4E3',
    danger: '#B91C1C',
  };
}

/** Styles texte SuperHote (TitleSection / Body / BodySmall). */
export function textStyles(c: Palette): Record<string, TextStyle> {
  return StyleSheet.create({
    titleSection: {
      fontFamily: font.semibold,
      fontSize: FontSize.L,
      fontWeight: FontWeight.SEMI_BOLD,
      lineHeight: 24,
      letterSpacing: -0.5,
      color: c.text,
    },
    body: {
      fontFamily: font.regular,
      fontSize: FontSize.S,
      fontWeight: FontWeight.NORMAL,
      lineHeight: 20,
      color: c.muted,
    },
    bodyNeutral: {
      fontFamily: font.regular,
      fontSize: FontSize.S,
      fontWeight: FontWeight.NORMAL,
      lineHeight: 20,
      color: c.text,
    },
    bodySmall: {
      fontFamily: font.regular,
      fontSize: FontSize.XS,
      fontWeight: FontWeight.NORMAL,
      lineHeight: 16,
      color: c.muted,
    },
    label: {
      fontFamily: font.medium,
      fontSize: FontSize.S,
      fontWeight: FontWeight.MEDIUM,
      lineHeight: 20,
      color: c.text,
    },
  });
}

/** @deprecated aliases — préférer Spacing / BorderRadius / FontSize */
export const space = {
  1: Spacing.XXS,
  2: Spacing.XS,
  3: Spacing.S,
  4: Spacing.M,
  5: 20,
  6: Spacing.L,
  8: Spacing.XL,
} as const;

export const radius = {
  sm: BorderRadius.S,
  md: BorderRadius.M,
  lg: BorderRadius.L,
  sheet: BorderRadius.XL,
} as const;

export const type = {
  xs: FontSize.XXS,
  sm: FontSize.XS,
  md: FontSize.S,
  lg: FontSize.M,
  xl: FontSize.L,
  weight: {
    regular: FontWeight.NORMAL,
    medium: FontWeight.MEDIUM,
    semibold: FontWeight.SEMI_BOLD,
  },
};
