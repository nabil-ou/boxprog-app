import { router, useFocusEffect } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, Trophy } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { RewardsList } from '@/components/profile/RewardsList';
import {
  loadRewards,
  loadSessionStats,
  rankLabel,
  rewardName,
  type RewardEntry,
  type SessionStats,
} from '@/lib/bookingStats';
import { errMsg } from '@/lib/supabase';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function SessionStatsCard({ boxId }: { boxId: string }) {
  const c = useBrand();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<RewardEntry[] | null>(null);
  const [rewardsError, setRewardsError] = useState<string | null>(null);

  const fetchRewards = useCallback(() => {
    loadRewards(boxId).then(
      (next) => {
        setRewards(next);
        setRewardsError(null);
      },
      (e: unknown) => setRewardsError(errMsg(e)),
    );
  }, [boxId]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadSessionStats(boxId).then(
        (next) => {
          if (!alive) return;
          setStats(next);
          setError(null);
        },
        (e: unknown) => {
          if (alive) setError(errMsg(e));
        },
      );
      return () => {
        alive = false;
      };
    }, [boxId]),
  );

  useFocusEffect(
    useCallback(() => {
      if (showRewards) fetchRewards();
    }, [showRewards, fetchRewards]),
  );

  const toggleRewards = () => setShowRewards((open) => !open);

  return (
    <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.text }]}>Mes séances</Text>
      {error && !stats ? (
        <Text style={[styles.note, { color: c.danger }]}>{error}</Text>
      ) : !stats ? (
        <ActivityIndicator color={c.primary} style={styles.spinner} />
      ) : (
        <>
          <View style={styles.row}>
            {[
              { label: 'Ce mois', value: stats.month },
              { label: 'Total', value: stats.total },
              { label: 'À venir', value: stats.upcoming },
            ].map((stat, index) => (
              <View
                key={stat.label}
                style={[styles.stat, index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
                <Text style={[styles.value, { color: c.text }]}>{stat.value}</Text>
                <Text style={[styles.label, { color: c.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          {stats.next ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Prochain palier ${rewardName(stats.next)} : ${stats.total} séances sur ${stats.next.threshold}`}
              accessibilityHint={showRewards ? 'Masquer les paliers' : 'Voir tous les paliers'}
              accessibilityState={{ expanded: showRewards }}
              onPress={toggleRewards}
              style={({ pressed }) => [styles.next, { borderTopColor: c.border, opacity: pressed ? 0.7 : 1 }]}>
              <View style={styles.nextHead}>
                <Text style={[styles.rankText, { color: c.text }]} numberOfLines={1}>
                  Prochain palier · {rewardName(stats.next)}
                  {stats.next.reward ? ` · ${stats.next.reward}` : ''}
                </Text>
                <Text style={[styles.nextCount, { color: c.muted }]}>
                  {stats.total} / {stats.next.threshold}
                </Text>
                <AppIcon icon={showRewards ? ChevronUp : ChevronDown} size={16} color={c.muted} />
              </View>
              <View style={[styles.track, { backgroundColor: c.raised }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.min(100, (stats.total / stats.next.threshold) * 100)}%`, backgroundColor: c.accent },
                  ]}
                />
              </View>
            </Pressable>
          ) : null}
          {stats.next && showRewards ? (
            <View style={[styles.rewards, { borderTopColor: c.border }]}>
              <RewardsList rewards={rewards} total={stats.total} error={rewardsError} />
            </View>
          ) : null}
          {stats.monthRank != null && stats.month > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voir le classement"
              onPress={() => router.push('/(tabs)/communaute')}
              style={({ pressed }) => [styles.rank, { borderTopColor: c.border, opacity: pressed ? 0.7 : 1 }]}>
              <AppIcon icon={Trophy} size={16} color={c.accent} />
              <Text style={[styles.rankText, { color: c.text }]}>
                {rankLabel(stats.monthRank)} du classement ce mois
              </Text>
              <AppIcon icon={ChevronRight} size={16} color={c.muted} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.XL,
    paddingTop: Spacing.M,
  },
  title: {
    paddingHorizontal: Spacing.M,
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  note: {
    padding: Spacing.M,
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  spinner: {
    marginVertical: Spacing.M,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.M,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.XXS,
  },
  value: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  rank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.S,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rankText: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  next: {
    gap: Spacing.XS,
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.S,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  nextCount: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    fontVariant: ['tabular-nums'],
  },
  rewards: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  track: {
    height: 6,
    borderRadius: BorderRadius.FULL,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.FULL,
  },
});
