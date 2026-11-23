import { StyleSheet, Text, View } from 'react-native';

import { rankLabel, sessionsLabel, type RankEntry } from '@/lib/bookingStats';
import { BorderRadius, FontSize, FontWeight, Spacing, font, mix, tint } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function MyRankCard({ entry }: { entry: RankEntry }) {
  const c = useBrand();
  const bg = tint(c.accent, 0.75, c.background);
  const divider = mix(bg, c.text, 0.2);
  const ranked = entry.sessions > 0;

  return (
    <View
      style={[styles.card, { backgroundColor: bg }]}
      accessible
      accessibilityLabel={
        ranked
          ? `Ta position : ${rankLabel(entry.rank)}, ${sessionsLabel(entry.sessions)}`
          : 'Ta position : aucune séance'
      }>
      <Text style={[styles.side, { color: c.text }]}>Ta position</Text>
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.rank}>
        <Text style={[styles.rankNum, { color: c.text }]}>{ranked ? entry.rank : '–'}</Text>
        {ranked ? <Text style={[styles.rankSup, { color: c.text }]}>{entry.rank === 1 ? 'er' : 'e'}</Text> : null}
      </View>
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <Text style={[styles.side, { color: c.text }]}>{sessionsLabel(entry.sessions)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.L,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.M,
  },
  side: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.medium,
    fontSize: FontSize.M,
    fontWeight: FontWeight.MEDIUM,
  },
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: 'stretch',
    marginVertical: Spacing.XXS,
  },
  rank: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rankNum: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXXL,
    fontWeight: FontWeight.BOLD,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
  },
  rankSup: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
    marginTop: 2,
    marginLeft: 1,
  },
});
