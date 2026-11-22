import { router } from 'expo-router';
import { ChevronRight, Target } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { BadgeThumb } from '@/components/profile/BadgeThumb';
import { ProgressBar } from '@/components/profile/ProgressBar';
import { useBadges } from '@/hooks/useBadges';
import { formatBadgeProgress } from '@/lib/badges';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function ObjectivesSection() {
  const c = useBrand();
  const { goals } = useBadges();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>Mes objectifs</Text>
      {goals.length === 0 ? (
        <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
          <Text style={[styles.empty, { color: c.muted }]}>
            Active « En faire mon objectif » sur un badge pour le suivre ici.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {goals.map((badge) => (
            <Pressable
              key={badge.id}
              accessibilityRole="button"
              accessibilityLabel={`Objectif ${badge.name}`}
              onPress={() => router.push(`/(tabs)/profil/badges/${badge.id}`)}
              style={({ pressed }) => [
                styles.card,
                styles.row,
                softShadow,
                { backgroundColor: c.surface, opacity: pressed ? 0.9 : 1 },
              ]}>
              <BadgeThumb badge={badge} size={48} showLabel={false} />
              <View style={styles.body}>
                <View style={styles.nameRow}>
                  <Target size={14} color={c.accent} strokeWidth={APP_ICON_STROKE} />
                  <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
                <Text style={[styles.hint, { color: c.muted }]}>
                  {formatBadgeProgress(badge.best, badge.nextTarget!, badge.unit)}
                </Text>
                <ProgressBar value={badge.progressToNext} height={6} />
              </View>
              <ChevronRight size={18} color={c.muted} strokeWidth={APP_ICON_STROKE} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.S,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
    paddingHorizontal: Spacing.XXS,
  },
  list: {
    gap: Spacing.S,
  },
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.M,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
  },
  body: {
    flex: 1,
    gap: Spacing.XXS,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XXS,
  },
  name: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    paddingVertical: Spacing.S,
  },
});
