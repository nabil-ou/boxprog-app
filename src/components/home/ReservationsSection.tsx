import { router } from 'expo-router';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { SessionDetailSheet } from '@/components/booking/SessionDetailSheet';
import { ReservationCard } from '@/components/home/ReservationCard';
import { reservationFromSession } from '@/components/home/mock';
import { bookClass, cancelClass, loadMyBookings, type Session } from '@/lib/booking';
import { errMsg } from '@/lib/supabase';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow, textStyles } from '@/lib/theme';
import { useBox, useBrand } from '@/providers/BoxProvider';

export function ReservationsSection() {
  const c = useBrand();
  const t = textStyles(c);
  const { box, access } = useBox();
  const openBooking = () => router.push('/(tabs)/reserver');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (access === 'loading') return;
    if (!box || access !== 'active') {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      setSessions(await loadMyBookings(box.id));
      setError('');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [box, access]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const cards = useMemo(() => sessions.map(reservationFromSession), [sessions]);
  const selected = sessions.find((s) => `${s.id}-${s.day}` === selectedId) ?? null;

  const change = async (fn: (slotId: string, day: string) => Promise<void>, session: Session) => {
    try {
      await fn(session.id, session.day);
      await reload();
      return true;
    } catch (e) {
      Alert.alert('Réservation impossible', errMsg(e));
      return false;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={t.titleSection}>Mes réservations</Text>
        <Pressable accessibilityRole="button" hitSlop={8} style={styles.seeAll} onPress={openBooking}>
          <Text style={[styles.seeAllText, { color: c.accent }]}>Tout voir</Text>
          <AppIcon icon={ChevronRight} size={14} color={c.accent} />
        </Pressable>
      </View>

      {loading ? null : error ? (
        <Text style={[styles.empty, { color: c.muted }]}>{error}</Text>
      ) : cards.length === 0 ? (
        <Text style={[styles.empty, { color: c.muted }]}>Aucune réservation à venir.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}>
          {cards.map((item) => (
            <ReservationCard key={item.id} item={item} onPress={() => setSelectedId(item.id)} />
          ))}
        </ScrollView>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={openBooking}
        style={({ pressed }) => [
          styles.cta,
          softShadow,
          { backgroundColor: c.primary, opacity: pressed ? 0.9 : 1 },
        ]}>
        <AppIcon icon={Calendar} size={18} color={c.accent} />
        <Text style={[styles.ctaLabel, { color: c.onPrimary }]}>Réserver une séance</Text>
        <AppIcon icon={ChevronRight} size={18} color={c.onPrimary} />
      </Pressable>

      {selected ? (
        <SessionDetailSheet
          key={`${selected.id}-${selected.day}`}
          session={selected}
          onClose={() => setSelectedId(null)}
          onBooked={(session) => change(bookClass, session)}
          onCancel={(session) => change(cancelClass, session)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.M,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.M,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  carousel: {
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
  },
  empty: {
    paddingHorizontal: Spacing.M,
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
  cta: {
    marginHorizontal: Spacing.M,
    minHeight: 52,
    borderRadius: BorderRadius.L,
    paddingHorizontal: Spacing.M,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
  },
  ctaLabel: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
});
