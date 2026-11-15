import type { Palette } from '@/lib/theme';

/**
 * Chrono zone — fixed dark navy from the maquette.
 * Accent stays the box brand (gold in the mock).
 */
export function chronoDark(c: Palette) {
  return {
    bg: '#0A0E17',
    card: '#121722',
    raised: '#181E2B',
    text: '#FFFFFF',
    muted: '#8E8E93',
    border: '#2A3140',
    accent: c.accent,
    onAccent: c.onAccent,
  };
}

export type ChronoDark = ReturnType<typeof chronoDark>;
