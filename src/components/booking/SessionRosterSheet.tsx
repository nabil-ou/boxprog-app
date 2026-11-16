import { Clock, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
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
import {
  loadRoster,
  sessionDurationMin,
  type RosterEntry,
  type Session,
} from '@/lib/booking';
import { longDate } from '@/lib/dates';
import { errMsg } from '@/lib/supabase';
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

export function SessionRosterSheet({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const duration = sessionDurationMin(session.start, session.end);
  const booked = roster.filter((r) => r.status === 'booked');
  const waitlist = roster.filter((r) => r.status === 'waitlist');

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    loadRoster(session.id, session.day)
      .then((rows) => {
        if (!alive) return;
        setRoster(rows);
      })
      .catch((e) => {
        if (!alive) return;
        setRoster([]);
        setError(errMsg(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [session.id, session.day]);

  const close = () => {
    progress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

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

            {loading ? (
              <Text style={[styles.empty, { color: c.muted }]}>Chargement…</Text>
            ) : error ? (
              <Text style={[styles.empty, { color: c.danger }]}>{error}</Text>
            ) : (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Text style={[styles.sectionLabel, { color: c.text }]}>Inscrits</Text>
                    <Text style={[styles.capacity, { color: c.text }]}>
                      {session.capacity == null
                        ? String(booked.length)
                        : `${booked.length} / ${session.capacity}`}
                    </Text>
                  </View>
                  {booked.length === 0 ? (
                    <Text style={[styles.emptyInline, { color: c.muted }]}>Aucun inscrit</Text>
                  ) : (
                    booked.map((person, index) => (
                      <PersonRow key={`booked-${person.displayName}-${index}`} person={person} />
                    ))
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Text style={[styles.sectionLabel, { color: c.text }]}>Liste d’attente</Text>
                    <Text style={[styles.capacity, { color: c.text }]}>{waitlist.length}</Text>
                  </View>
                  {waitlist.length === 0 ? (
                    <Text style={[styles.emptyInline, { color: c.muted }]}>Personne en attente</Text>
                  ) : (
                    waitlist.map((person, index) => (
                      <PersonRow key={`wait-${person.displayName}-${index}`} person={person} rank={index + 1} />
                    ))
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function PersonRow({ person, rank }: { person: RosterEntry; rank?: number }) {
  const c = useBrand();
  return (
    <View style={styles.personRow}>
      {rank != null ? (
        <Text style={[styles.rank, { color: c.muted }]}>{rank}</Text>
      ) : null}
      <Avatar name={person.displayName} uri={person.avatarUrl} size={36} />
      <Text style={[styles.personName, { color: c.text }]} numberOfLines={1}>
        {person.displayName}
      </Text>
    </View>
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
  section: {
    gap: Spacing.XS,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.XXS,
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
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    minHeight: 44,
  },
  rank: {
    width: 20,
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    textAlign: 'center',
  },
  personName: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  empty: {
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: FontSize.S,
    paddingVertical: Spacing.L,
  },
  emptyInline: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    paddingVertical: Spacing.XS,
  },
});
