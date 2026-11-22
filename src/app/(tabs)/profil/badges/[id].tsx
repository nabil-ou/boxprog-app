import { router, useLocalSearchParams } from 'expo-router';
import { Check, Lock, Target } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { Button } from '@/components/Button';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { BadgeThumb } from '@/components/profile/BadgeThumb';
import { ProgressBar } from '@/components/profile/ProgressBar';
import { useBadges } from '@/hooks/useBadges';
import {
  formatBadgeProgress,
  formatTierLabel,
  nextTierHint,
  TIER_ROMAN,
} from '@/lib/badges';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export default function BadgeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { get, isObjective, setObjective } = useBadges();
  const badge = id ? get(id) : undefined;

  if (!badge) {
    return (
      <View style={[styles.root, { backgroundColor: c.background }]}>
        <PrimaryHeader title="Badge" onBack={() => router.back()} />
        <Text style={[styles.missing, { color: c.muted }]}>Badge introuvable</Text>
      </View>
    );
  }

  const locked = badge.tierIndex < 0;
  const canBeObjective = badge.nextTarget != null;
  const pinned = isObjective(badge.id);
  const nextRequirement = badge.nextTarget
    ? nextTierHint(badge.nextTarget, badge.unit)
    : 'Tous les paliers sont débloqués.';

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title={badge.name} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.XL },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.status, { backgroundColor: locked ? c.raised : c.accent }]}>
            {locked ? <Lock size={12} color={c.muted} strokeWidth={APP_ICON_STROKE} /> : null}
            <Text style={[styles.statusTxt, { color: locked ? c.muted : c.onAccent }]}>
              {locked
                ? 'À débloquer'
                : badge.nextTarget
                  ? `Palier ${TIER_ROMAN[badge.tierIndex]}`
                  : 'Palier max'}
            </Text>
          </View>
          <BadgeThumb badge={badge} size={140} showLabel={false} />
        </View>

        <Text style={[styles.name, { color: c.text }]}>{badge.name}</Text>
        <Text style={[styles.tagline, { color: c.muted }]}>{badge.tagline}</Text>

        <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Pour obtenir ce badge</Text>
          <Text style={[styles.requirement, { color: c.secondary }]}>{badge.requirement}</Text>
          <Text style={[styles.nextHint, { color: c.muted }]}>{nextRequirement}</Text>
          {badge.nextTarget != null ? (
            <View style={styles.progressBlock}>
              <Text style={[styles.progressLabel, { color: c.text }]}>
                {formatBadgeProgress(badge.best, badge.nextTarget, badge.unit)}
              </Text>
              <ProgressBar value={badge.progressToNext} height={8} />
            </View>
          ) : null}
        </View>

        <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Paliers</Text>
          {badge.tiers.map((target, index) => {
            const done = badge.tierIndex >= index;
            const current = badge.nextTarget === target;
            return (
              <View
                key={`${badge.id}-${target}`}
                style={[
                  styles.tierRow,
                  index < badge.tiers.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: c.border,
                  },
                ]}>
                <View
                  style={[
                    styles.tierIcon,
                    { backgroundColor: done ? c.accent : c.raised },
                  ]}>
                  {done ? (
                    <Check size={14} color={c.onAccent} strokeWidth={APP_ICON_STROKE} />
                  ) : (
                    <Lock size={12} color={c.muted} strokeWidth={APP_ICON_STROKE} />
                  )}
                </View>
                <View style={styles.tierBody}>
                  <Text style={[styles.tierName, { color: done || current ? c.text : c.muted }]}>
                    Palier {TIER_ROMAN[index]} — {formatTierLabel(target, badge.unit)}
                  </Text>
                  <Text style={[styles.tierState, { color: c.muted }]}>
                    {done ? 'Débloqué' : current ? 'En cours' : 'À venir'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {canBeObjective ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setObjective(badge.id, !pinned)}
            style={[styles.objectiveRow, softShadow, { backgroundColor: c.surface }]}>
            <View style={[styles.targetIcon, { backgroundColor: c.raised }]}>
              <Target size={18} color={c.accent} strokeWidth={APP_ICON_STROKE} />
            </View>
            <Text style={[styles.objectiveLabel, { color: c.text }]}>En faire mon objectif</Text>
            <Switch
              value={pinned}
              onValueChange={(on) => setObjective(badge.id, on)}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor={c.surface}
            />
          </Pressable>
        ) : null}

        <Button
          label={locked ? 'Ajouter un PR' : 'Voir / ajouter un PR'}
          onPress={() => router.push(`/(tabs)/records/${badge.movementId}`)}
        />
        <Text style={[styles.footnote, { color: c.muted }]}>
          Les badges se débloquent automatiquement selon ton meilleur PR
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: Spacing.M,
    gap: Spacing.M,
    alignItems: 'stretch',
  },
  missing: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    marginTop: Spacing.XL,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.M,
    paddingTop: Spacing.S,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XXS,
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.XXS,
    borderRadius: BorderRadius.FULL,
  },
  statusTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  name: {
    fontFamily: font.semibold,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SEMI_BOLD,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    marginTop: -Spacing.XS,
  },
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.L,
    gap: Spacing.S,
  },
  cardTitle: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  requirement: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    lineHeight: 22,
  },
  nextHint: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  progressBlock: {
    gap: Spacing.XS,
    marginTop: Spacing.XXS,
  },
  progressLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingVertical: Spacing.S,
  },
  tierIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBody: {
    flex: 1,
    gap: 2,
  },
  tierName: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
  },
  tierState: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    borderRadius: BorderRadius.XL,
    padding: Spacing.M,
  },
  targetIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveLabel: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
  },
  footnote: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    textAlign: 'center',
  },
});
