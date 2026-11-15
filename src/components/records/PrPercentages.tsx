import { StyleSheet, Text, View } from 'react-native';

import { formatPrValue, PR_PERCENTAGES, type PrUnit } from '@/lib/records';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function PrPercentages({
  oneRm,
  unit,
}: {
  oneRm: number | undefined;
  unit: PrUnit;
}) {
  const c = useBrand();

  if (unit !== 'kg' || !oneRm) {
    return (
      <View style={[styles.empty, { backgroundColor: c.raised }]}>
        <Text style={[styles.emptyTxt, { color: c.muted }]}>
          Les pourcentages sont dispo pour les lifts en kg avec un 1 RM.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.heroLabel, { color: c.muted }]}>1 RM de référence</Text>
        <Text style={[styles.heroValue, { color: c.text }]}>{formatPrValue(oneRm, unit)}</Text>
      </View>

      <View style={styles.grid}>
        {PR_PERCENTAGES.map((pct) => {
          const load = Math.round((oneRm * pct) / 100);
          const isMax = pct === 100;
          const isHalf = pct === 50;
          const bg = isMax ? c.primary : isHalf ? c.accent : c.surface;
          const border = isMax ? c.primary : isHalf ? c.accent : c.border;
          const pctColor = isMax ? c.accent : isHalf ? c.onAccent : c.secondary;
          const loadColor = isMax ? c.onPrimary : isHalf ? c.onAccent : c.text;
          const unitColor = isMax ? c.onPrimaryMuted : isHalf ? c.onAccent : c.muted;
          return (
            <View
              key={pct}
              style={[styles.tile, softShadow, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.tilePct, { color: pctColor }]}>{pct} %</Text>
              <Text style={[styles.tileLoad, { color: loadColor }]}>{load}</Text>
              <Text style={[styles.tileUnit, { color: unitColor }]}>kg</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.M,
  },
  hero: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    paddingVertical: Spacing.L,
    paddingHorizontal: Spacing.M,
    alignItems: 'center',
    gap: Spacing.XS,
  },
  heroLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  heroValue: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXXL,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.XS,
  },
  tile: {
    width: '23.2%',
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.XXS,
    alignItems: 'center',
    gap: 2,
  },
  tilePct: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
  },
  tileLoad: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
  tileUnit: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.MEDIUM,
  },
  empty: {
    borderRadius: BorderRadius.L,
    padding: Spacing.L,
    alignItems: 'center',
  },
  emptyTxt: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
  },
});
