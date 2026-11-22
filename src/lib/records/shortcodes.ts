import { formatPrValue, getMovement } from '@/lib/records/catalog';

const SHORTCODE = /@([a-z0-9-]+):(\d+(?:[.,]\d+)?)%/gi;

/**
 * Remplace `@back-squat:70%` par la charge tirée du PR (`67 kg`), ou par `70%` sans PR.
 * Mêmes règles que le site (src/lib/records.ts) et que l'onglet Pourcentages.
 */
export function resolvePrShortcodes(text: string, best: Record<string, number>): string {
  return text.replace(SHORTCODE, (_, rawId: string, rawPct: string) => {
    const id = rawId.toLowerCase();
    const pr = getMovement(id)?.unit === 'kg' ? best[id] : undefined;
    if (!pr) return `${rawPct}%`;
    return formatPrValue(Math.round((pr * Number(rawPct.replace(',', '.'))) / 100), 'kg');
  });
}
