import * as Haptics from 'expo-haptics';
import { Share as ShareIcon, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { Button } from '@/components/Button';
import { BadgeThumb } from '@/components/profile/BadgeThumb';
import {
  UnlockBurst,
  UNLOCK_ACTIONS_DELAY_MS,
  UNLOCK_COPY_DELAY_MS,
} from '@/components/profile/UnlockBurst';
import {
  formatTierLabel,
  statusFromBest,
  TIER_ROMAN,
  type BadgeDef,
  type BadgeUnlock,
  type BadgeWithStatus,
} from '@/lib/badges';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function BadgeUnlockModal({
  badge,
  unlock,
  onClose,
}: {
  badge: BadgeDef;
  unlock: BadgeUnlock;
  onClose: () => void;
}) {
  const c = useBrand();
  const box = useActiveBox();
  const insets = useSafeAreaInsets();
  const [canDismiss, setCanDismiss] = useState(false);

  const display = useMemo((): BadgeWithStatus => {
    const status = statusFromBest(unlock.target, badge.tiers, badge.unit);
    return {
      ...badge,
      ...status,
      tierIndex: unlock.tierIndex,
      best: unlock.target,
    };
  }, [badge, unlock]);

  const actionsOpacity = useSharedValue(0);
  const copyOpacity = useSharedValue(0);

  const onBurst = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
  }, []);

  useEffect(() => {
    // Soft tick au démarrage de la charge.
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    copyOpacity.value = withDelay(UNLOCK_COPY_DELAY_MS, withTiming(1, { duration: 380 }));
    actionsOpacity.value = withDelay(UNLOCK_ACTIONS_DELAY_MS, withTiming(1, { duration: 280 }));

    const timer = setTimeout(() => setCanDismiss(true), UNLOCK_ACTIONS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [actionsOpacity, copyOpacity]);

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
  }));

  const share = async () => {
    const roman = TIER_ROMAN[unlock.tierIndex] ?? '';
    const message = `Nouveau badge débloqué sur ${box.name} : ${badge.name} — Palier ${roman} (${formatTierLabel(unlock.target, badge.unit)}) 💪`;
    try {
      await Share.share({ message });
    } catch {
      /* cancelled */
    }
  };

  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => {
        if (canDismiss) onClose();
      }}>
      <View style={[styles.root, { backgroundColor: c.primary, paddingTop: insets.top }]}>
        <Animated.View
          style={[styles.closeRow, { paddingRight: Spacing.M }, actionsStyle]}
          pointerEvents={canDismiss ? 'auto' : 'none'}>
          {canDismiss ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeBtn}>
              <X size={24} color={c.onPrimary} strokeWidth={APP_ICON_STROKE} />
            </Pressable>
          ) : (
            <View style={styles.closeSpacer} />
          )}
        </Animated.View>

        <View style={styles.center}>
          <Animated.Text style={[styles.eyebrow, { color: c.accent }, copyStyle]}>
            Nouveau badge
          </Animated.Text>

          <UnlockBurst accent={c.accent} light={c.onPrimary} onBurst={onBurst}>
            <BadgeThumb badge={display} size={160} showLabel={false} />
          </UnlockBurst>

          <Animated.Text style={[styles.name, { color: c.onPrimary }, copyStyle]}>
            {badge.name}
          </Animated.Text>
          <Animated.Text style={[styles.tier, { color: c.onPrimaryMuted }, copyStyle]}>
            Palier {TIER_ROMAN[unlock.tierIndex]} — {formatTierLabel(unlock.target, badge.unit)}
          </Animated.Text>
        </View>

        <Animated.View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.M },
            actionsStyle,
          ]}
          pointerEvents={canDismiss ? 'auto' : 'none'}>
          {canDismiss ? (
            <Button label="Partager" onPress={() => void share()} style={styles.shareBtn} />
          ) : (
            <View style={styles.sharePlaceholder} />
          )}
          {canDismiss ? (
            <View style={styles.shareHint}>
              <ShareIcon size={14} color={c.onPrimaryMuted} strokeWidth={APP_ICON_STROKE} />
              <Text style={[styles.hintTxt, { color: c.onPrimaryMuted }]}>Montre ta progression</Text>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  closeRow: {
    alignItems: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSpacer: {
    width: 44,
    height: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.L,
    gap: Spacing.S,
  },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.XS,
  },
  name: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXL,
    fontWeight: FontWeight.SEMI_BOLD,
    textAlign: 'center',
    marginTop: -Spacing.S,
  },
  tier: {
    fontFamily: font.medium,
    fontSize: FontSize.M,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.L,
    gap: Spacing.S,
  },
  shareBtn: {
    width: '100%',
  },
  sharePlaceholder: {
    height: 48,
  },
  shareHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.XXS,
  },
  hintTxt: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
});
