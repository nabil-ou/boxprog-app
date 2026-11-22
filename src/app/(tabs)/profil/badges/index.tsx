import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryHeader } from '@/components/PrimaryHeader';
import { BadgeThumb } from '@/components/profile/BadgeThumb';
import { ProgressBar } from '@/components/profile/ProgressBar';
import { useBadges } from '@/hooks/useBadges';
import type { BadgeFilter } from '@/lib/badges';
import { BorderRadius, FontSize, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export default function BadgesCollectionScreen() {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { unlocked, locked, total, list, loading } = useBadges();
  const [filter, setFilter] = useState<BadgeFilter>('unlocked');
  const items = useMemo(() => list(filter), [list, filter]);
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Ma collection" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.tagline, { color: c.muted }]}>Un mouvement. Une nouvelle fierté.</Text>

        <View style={[styles.progressCard, softShadow, { backgroundColor: c.surface }]}>
          <Text style={[styles.progressLabel, { color: c.text }]}>
            {unlocked} débloqué{unlocked > 1 ? 's' : ''} · {locked} à découvrir
          </Text>
          <ProgressBar value={pct} height={8} />
        </View>

        <View style={[styles.segment, { backgroundColor: c.raised }]}>
          {(
            [
              { value: 'unlocked', label: 'Débloqués' },
              { value: 'locked', label: 'À découvrir' },
            ] as const
          ).map((opt) => {
            const on = filter === opt.value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(opt.value)}
                style={[styles.segmentBtn, on && { backgroundColor: c.surface, ...softShadow }]}>
                <Text
                  style={[
                    styles.segmentTxt,
                    { color: on ? c.text : c.muted, fontFamily: on ? font.semibold : font.regular },
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.XL }} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>
            {filter === 'unlocked' ? 'Aucun badge débloqué — ajoute un PR gym' : 'Tout est déjà débloqué'}
          </Text>
        ) : (
          <View style={styles.grid}>
            {items.map((badge) => (
              <View key={badge.id} style={styles.cell}>
                <BadgeThumb
                  badge={badge}
                  size={88}
                  onPress={() => router.push(`/(tabs)/profil/badges/${badge.id}`)}
                />
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.footer, { color: c.secondary }]}>Ta collection grandit avec toi</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: Spacing.M,
    gap: Spacing.M,
  },
  tagline: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
  },
  progressCard: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.M,
    gap: Spacing.S,
  },
  progressLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: BorderRadius.FULL,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.S,
    borderRadius: BorderRadius.FULL,
  },
  segmentTxt: {
    fontSize: FontSize.XS,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.XXS,
  },
  cell: {
    width: '33.333%',
    padding: Spacing.S,
    alignItems: 'center',
  },
  empty: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    paddingVertical: Spacing.XL,
  },
  footer: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.S,
  },
});
