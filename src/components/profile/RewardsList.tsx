import { Check, Gift } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { rewardName, sessionsLabel, type RewardEntry } from '@/lib/bookingStats';
import { mediumDate } from '@/lib/dates';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

/** Paliers d'assiduité de la box : atteints (avec leur date) et à venir (séances restantes). */
export function RewardsList({ rewards, total, error }: { rewards: RewardEntry[] | null; total: number; error: string | null }) {
  const c = useBrand();

  if (error) return <Text style={[styles.note, { color: c.danger }]}>{error}</Text>;
  if (!rewards) return <ActivityIndicator color={c.primary} style={styles.spinner} />;
  if (!rewards.length) return <Text style={[styles.note, { color: c.muted }]}>Aucun palier à la box pour l’instant.</Text>;

  return (
    <View>
      {rewards.map((r, i) => {
        const reached = r.status != null;
        const status =
          r.status == null
            ? `Encore ${sessionsLabel(r.threshold - total)}`
            : r.status === 'pending'
              ? 'À récupérer à la box'
              : r.status === 'delivered'
                ? 'Remis'
                : r.reachedOn
                  ? `Atteint le ${mediumDate(r.reachedOn)}`
                  : 'Atteint';
        return (
          <View
            key={r.threshold}
            style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}>
            <View style={[styles.dot, { backgroundColor: reached ? c.accent : c.raised }]}>
              {reached ? <AppIcon icon={r.status === 'pending' ? Gift : Check} size={14} color={c.onAccent} /> : null}
            </View>
            <View style={styles.text}>
              <Text style={[styles.name, { color: reached ? c.text : c.secondary }]} numberOfLines={1}>
                {rewardName(r)}
              </Text>
              {r.reward ? (
                <Text style={[styles.reward, { color: c.muted }]} numberOfLines={2}>
                  {r.reward}
                </Text>
              ) : null}
            </View>
            <Text style={[styles.status, { color: r.status === 'pending' ? c.link : c.muted }]}>{status}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.S,
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  spinner: {
    marginVertical: Spacing.S,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.S,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  reward: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  status: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    maxWidth: '40%',
  },
});
