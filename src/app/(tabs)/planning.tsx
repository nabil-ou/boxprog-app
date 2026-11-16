import { router } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { SessionRosterSheet } from '@/components/booking/SessionRosterSheet';
import { SessionSlotRow } from '@/components/booking/SessionSlotRow';
import { SessionTypeChips } from '@/components/booking/SessionTypeChips';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { DateScroller } from '@/components/today/DateScroller';
import { loadSessions, type Session } from '@/lib/booking';
import { longDate, todayIso } from '@/lib/dates';
import { errMsg } from '@/lib/supabase';
import { BorderRadius, FontSize, FontWeight, Spacing, font, textStyles } from '@/lib/theme';
import type { Role } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

const STAFF_ROLES = new Set<Role>(['owner', 'admin', 'coach']);

export default function PlanningScreen() {
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const box = useActiveBox();
  const today = todayIso();
  const [day, setDay] = useState(today);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [type, setType] = useState('all');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Session | null>(null);

  const isStaff = Boolean(box.my_role && STAFF_ROLES.has(box.my_role));

  useEffect(() => {
    if (!isStaff) router.back();
  }, [isStaff]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setSessions(await loadSessions(box.id, day));
      setError('');
    } catch (e) {
      setSessions([]);
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [box.id, day]);

  useEffect(() => {
    if (!isStaff) return;
    void reload();
  }, [isStaff, reload]);

  useEffect(() => {
    if (type !== 'all' && !sessions.some((s) => s.type === type)) setType('all');
  }, [sessions, type]);

  const filters = useMemo(() => {
    const names = [...new Set(sessions.map((s) => s.type))];
    return [{ value: 'all', label: 'Tous' }, ...names.map((name) => ({ value: name, label: name }))];
  }, [sessions]);

  const shown = type === 'all' ? sessions : sessions.filter((s) => s.type === type);
  const dayLabel = day === today ? 'Aujourd’hui' : longDate(day);
  const open = selected ? shown.find((s) => s.id === selected.id && s.day === selected.day) ?? selected : null;

  if (!isStaff) {
    return <View style={[styles.root, { backgroundColor: c.background }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Planning" onBack={() => router.back()} />

      <View style={[styles.scrollerBand, { backgroundColor: c.primary }]}>
        <DateScroller value={day} today={today} minDate={today} onChange={setDay} />
      </View>

      <View style={styles.dayRow}>
        <Text style={[t.titleSection, styles.dayTitle]} numberOfLines={1}>
          {dayLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtres"
          accessibilityState={{ expanded: filtersOpen }}
          onPress={() => setFiltersOpen((v) => !v)}
          style={({ pressed }) => [
            styles.filterBtn,
            {
              backgroundColor: filtersOpen ? c.primary : c.surface,
              borderColor: filtersOpen ? c.accent : c.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}>
          <AppIcon icon={SlidersHorizontal} size={18} color={filtersOpen ? c.onPrimary : c.text} />
        </Pressable>
      </View>

      {filtersOpen && filters.length > 1 ? (
        <View style={styles.chips}>
          <SessionTypeChips value={type} options={filters} onChange={setType} />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.XL },
        ]}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={[t.body, styles.empty]}>Chargement…</Text>
        ) : error ? (
          <Text style={[t.body, styles.empty]}>{error}</Text>
        ) : shown.length === 0 ? (
          <Text style={[t.body, styles.empty]}>Aucune séance pour ce jour.</Text>
        ) : (
          shown.map((item) => (
            <SessionSlotRow
              key={`${item.id}-${item.day}`}
              item={item}
              variant="staff"
              onPress={() => setSelected(item)}
            />
          ))
        )}
      </ScrollView>

      {open ? (
        <SessionRosterSheet
          key={`${open.id}-${open.day}`}
          session={open}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollerBand: {
    paddingTop: Spacing.XS,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.L,
    paddingBottom: Spacing.S,
  },
  dayTitle: {
    flex: 1,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.M,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    paddingBottom: Spacing.S,
  },
  list: {
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.XL,
    fontFamily: font.regular,
    fontSize: FontSize.S,
    fontWeight: FontWeight.NORMAL,
  },
});
