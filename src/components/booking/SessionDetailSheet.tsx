import { router } from 'expo-router';
import { Check, ChevronRight, Clock, Dumbbell, Info, X } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { sessionDurationMin, type Session } from '@/lib/booking';
import { longDate } from '@/lib/dates';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
  font,
  softShadow,
  textStyles,
  tint,
} from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const SUCCESS = '#16A34A';

type Done = (session: Session) => void | boolean | Promise<void | boolean>;

export function SessionDetailSheet({
  session,
  onClose,
  onBooked,
  onCancel,
}: {
  session: Session;
  onClose: () => void;
  onBooked?: Done;
  onCancel?: Done;
}) {
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const duration = sessionDurationMin(session.start, session.end);
  const remaining = session.capacity == null ? null : Math.max(0, session.capacity - session.booked);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  const close = () => {
    progress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const finish = (fn?: Done) => {
    void Promise.resolve(fn?.(session)).then((ok) => {
      if (ok !== false) close();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

  const confirmBook = () => {
    Alert.alert(
      'Confirmer la réservation',
      `Réserver ${session.type} le ${longDate(session.day)} à ${session.start} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => finish(onBooked),
        },
      ],
    );
  };

  const confirmWaitlist = () => {
    Alert.alert(
      'Liste d’attente',
      `Rejoindre la liste d’attente pour ${session.type} à ${session.start} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejoindre',
          onPress: () => finish(onBooked),
        },
      ],
    );
  };

  const confirmCancel = () => {
    Alert.alert(
      'Annuler ma participation',
      `Te désinscrire de ${session.type} le ${longDate(session.day)} à ${session.start} ?`,
      [
        { text: 'Garder ma place', style: 'cancel' },
        {
          text: 'Me désinscrire',
          style: 'destructive',
          onPress: () => finish(onCancel),
        },
      ],
    );
  };

  const goToWod = () => {
    close();
    router.push('/(tabs)/wod');
  };

  const cta =
    session.status === 'booked' || session.status === 'waitlist'
      ? {
          label: 'Me désinscrire',
          onPress: confirmCancel,
          disabled: false,
          danger: true,
        }
      : session.status === 'full'
        ? {
            label: 'Rejoindre la liste d’attente',
            onPress: confirmWaitlist,
            disabled: false,
            danger: false,
          }
        : {
            label: 'Réserver ma place',
            onPress: confirmBook,
            disabled: false,
            danger: false,
          };

  return (
    <Modal visible animationType="none" transparent statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={close} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: c.surface,
              paddingBottom: Math.max(insets.bottom, Spacing.M),
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />

          <View style={styles.head}>
            <View style={styles.headText}>
              <Text style={[styles.eyebrow, { color: c.accent }]}>SÉANCE</Text>
              <Text style={[styles.title, { color: c.text }]}>{session.type}</Text>
              <Text style={[t.body, { color: c.muted }]}>{longDate(session.day)}</Text>
            </View>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityLabel="Fermer"
              style={[styles.closeBtn, softShadow, { backgroundColor: c.raised, borderColor: c.border }]}>
              <AppIcon icon={X} size={18} color={c.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}>
            <View style={styles.metaRow}>
              <AppIcon icon={Clock} size={18} color={c.muted} />
              <Text style={[styles.metaTime, { color: c.text }]}>
                {session.start} — {session.end}
              </Text>
              <View style={[styles.durationPill, { backgroundColor: tint(c.accent, 0.85, c.raised) }]}>
                <Text style={[styles.durationText, { color: c.ink }]}>{duration} min</Text>
              </View>
            </View>

            {session.coachName ? (
              <View style={styles.coachRow}>
                <Avatar name={session.coachName} uri={session.coachAvatarUrl} size={40} />
                <View style={styles.coachText}>
                  <Text style={[styles.coachName, { color: c.text }]}>{session.coachName}</Text>
                  <Text style={[styles.coachRole, { color: c.muted }]}>Coach</Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: c.border }]} />

            <View style={styles.capacityBlock}>
              <View style={styles.participantsHead}>
                <Text style={[styles.sectionLabel, { color: c.text }]}>Inscrits</Text>
                <Text style={[styles.capacity, { color: c.text }]}>
                  {session.capacity == null ? session.booked : `${session.booked} / ${session.capacity}`}
                </Text>
              </View>
              {session.status === 'booked' ? (
                <View style={styles.statusRow}>
                  <AppIcon icon={Check} size={14} color={SUCCESS} />
                  <Text style={[styles.spotsOk, { color: SUCCESS }]}>Tu es inscrit</Text>
                </View>
              ) : session.status === 'waitlist' ? (
                <Text style={[styles.spotsWarn, { color: c.accent }]}>Tu es en liste d’attente</Text>
              ) : session.status === 'full' ? (
                <Text style={[styles.spotsWarn, { color: c.accent }]}>Complet · liste d’attente</Text>
              ) : remaining == null ? (
                <Text style={[styles.spotsOk, { color: SUCCESS }]}>Ouvert</Text>
              ) : (
                <Text style={[styles.spotsOk, { color: SUCCESS }]}>
                  {remaining} place{remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''}
                </Text>
              )}
              {session.waitlist > 0 && session.status !== 'waitlist' ? (
                <Text style={[styles.spotsWarn, { color: c.muted }]}>
                  {session.waitlist} en liste d’attente
                </Text>
              ) : null}
            </View>

            {session.hasProgramming ? (
              <Pressable
                accessibilityRole="button"
                onPress={goToWod}
                style={({ pressed }) => [
                  styles.wodLink,
                  { borderColor: c.border, backgroundColor: c.raised, opacity: pressed ? 0.9 : 1 },
                ]}>
                <AppIcon icon={Dumbbell} size={18} color={c.primary} />
                <Text style={[styles.wodLinkText, { color: c.text }]}>Voir le contenu de la séance</Text>
                <AppIcon icon={ChevronRight} size={18} color={c.muted} />
              </Pressable>
            ) : null}

            <View style={styles.infoRow}>
              <AppIcon icon={Info} size={16} color={c.muted} />
              <Text style={[styles.infoText, { color: c.muted }]}>
                Les conditions d’annulation sont précisées par la box.
              </Text>
            </View>
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: cta.disabled }}
            disabled={cta.disabled}
            onPress={cta.onPress}
            style={({ pressed }) => [
              styles.cta,
              softShadow,
              cta.danger
                ? {
                    backgroundColor: c.surface,
                    borderWidth: 1.5,
                    borderColor: c.danger,
                    opacity: pressed ? 0.9 : 1,
                  }
                : {
                    backgroundColor: cta.disabled ? c.raised : c.primary,
                    borderWidth: 0,
                    opacity: cta.disabled ? 1 : pressed ? 0.9 : 1,
                  },
            ]}>
            <Text
              style={[
                styles.ctaLabel,
                { color: cta.danger ? c.danger : cta.disabled ? c.muted : c.onPrimary },
              ]}>
              {cta.label}
            </Text>
            {!cta.disabled && !cta.danger ? (
              <AppIcon icon={ChevronRight} size={18} color={c.onPrimary} />
            ) : null}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fill: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.XXL,
    borderTopRightRadius: BorderRadius.XXL,
    maxHeight: '88%',
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.S,
    marginBottom: Spacing.XS,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.S,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXL,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 0 },
  body: {
    gap: Spacing.M,
    paddingBottom: Spacing.S,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  metaTime: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  durationPill: {
    paddingHorizontal: Spacing.S,
    paddingVertical: 4,
    borderRadius: BorderRadius.FULL,
  },
  durationText: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
  },
  coachText: { gap: 2 },
  coachName: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  coachRole: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  capacityBlock: {
    gap: Spacing.XS,
  },
  participantsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  capacity: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotsOk: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  spotsWarn: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  wodLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.M,
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    minHeight: 48,
  },
  wodLinkText: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.XS,
  },
  infoText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
    lineHeight: 16,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.XS,
    minHeight: 52,
    borderRadius: BorderRadius.L,
    paddingHorizontal: Spacing.M,
  },
  ctaLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
});
