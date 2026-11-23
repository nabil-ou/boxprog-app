import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import type { RankEntry } from '@/lib/bookingStats';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow, textStyles, tint } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

/** Classement hors podium. */
export function BookingRanking({ rows }: { rows: RankEntry[] }) {
  const c = useBrand();
  const t = textStyles(c);
  if (!rows.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={t.titleSection}>Classement</Text>
        <Text style={[styles.column, { color: c.muted }]}>Séances</Text>
      </View>
      <View style={[styles.list, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
        {rows.map((r, i) => {
          const ranked = r.sessions > 0;
          return (
            <View
              key={`${r.rank}-${r.displayName}-${i}`}
              style={[
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
                r.isMe && { backgroundColor: tint(c.primary, 0.94, c.background) },
              ]}>
              <Text style={[styles.rank, { color: ranked ? c.text : c.muted }]}>{ranked ? r.rank : '–'}</Text>
              <Avatar name={r.displayName} uri={r.avatarUrl} size={40} />
              <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                {r.displayName}
                {r.isMe ? ' (toi)' : ''}
              </Text>
              <Text style={[styles.value, { color: ranked ? c.text : c.muted }]}>{r.sessions}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.S,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  column: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  list: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.M,
  },
  rank: {
    minWidth: 24,
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.medium,
    fontSize: FontSize.M,
    fontWeight: FontWeight.MEDIUM,
  },
  value: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
});
