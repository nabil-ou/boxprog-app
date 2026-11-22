import { Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { badgeInitials, TIER_ROMAN, type BadgeWithStatus } from '@/lib/badges';
import { BorderRadius, FontSize, FontWeight, Spacing, font, mix } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function BadgeThumb({
  badge,
  size = 72,
  showLabel = true,
  onPress,
}: {
  badge: BadgeWithStatus;
  size?: number;
  showLabel?: boolean;
  onPress?: () => void;
}) {
  const c = useBrand();
  const locked = badge.tierIndex < 0;
  const tierBoost = locked ? 0 : (badge.tierIndex + 1) * 0.12;
  const fill = locked ? c.raised : mix(c.primary, c.accent, Math.min(0.55, 0.1 + tierBoost));

  const content = (
    <View style={[styles.wrap, { width: size + (showLabel ? 8 : 0) }]}>
      {!locked && badge.tierIndex >= 0 ? (
        <View style={[styles.tierTag, { backgroundColor: c.accent }]}>
          <Text style={[styles.tierTxt, { color: c.onAccent }]}>{TIER_ROMAN[badge.tierIndex]}</Text>
        </View>
      ) : null}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: fill,
            borderColor: locked ? c.border : c.accent,
            opacity: locked ? 0.5 : 1,
          },
        ]}>
        <Text
          style={[
            styles.initials,
            {
              color: locked ? c.muted : c.onPrimary,
              fontSize: size * 0.28,
            },
          ]}>
          {badgeInitials(badge.name)}
        </Text>
        {locked ? (
          <View style={[styles.lock, { backgroundColor: c.surface }]}>
            <Lock size={Math.max(10, size * 0.18)} color={c.muted} strokeWidth={APP_ICON_STROKE} />
          </View>
        ) : null}
      </View>
      {showLabel ? (
        <Text style={[styles.label, { color: locked ? c.muted : c.text }]} numberOfLines={2}>
          {badge.name}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge.name}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.XS,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  initials: {
    fontFamily: font.semibold,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  lock: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: BorderRadius.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTag: {
    position: 'absolute',
    top: -6,
    zIndex: 1,
    paddingHorizontal: Spacing.XS,
    paddingVertical: 2,
    borderRadius: BorderRadius.FULL,
  },
  tierTxt: {
    fontFamily: font.semibold,
    fontSize: 10,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  label: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    textAlign: 'center',
    lineHeight: 16,
  },
});
