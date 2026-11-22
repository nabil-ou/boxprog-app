import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { BadgeUnlockModal } from '@/components/profile/BadgeUnlockModal';
import { PrAddSheet } from '@/components/records/PrAddSheet';
import { PrPercentages } from '@/components/records/PrPercentages';
import { PrProgressChart } from '@/components/records/PrProgressChart';
import {
  getBadge,
  higherIsBetter,
  unlockFromPr,
  type BadgeDef,
  type BadgeUnlock,
} from '@/lib/badges';
import {
  entriesFor,
  formatPrDate,
  formatPrValue,
  getMovement,
  historyTitle,
  type PersonalRecord,
} from '@/lib/records';
import { usePersonalRecords } from '@/providers/RecordsProvider';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Height,
  Spacing,
  font,
  softShadow,
} from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

type Tab = 'progression' | 'percentages';

type Celebration = { badge: BadgeDef; unlock: BadgeUnlock };

export default function MovementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('progression');
  const [editing, setEditing] = useState<PersonalRecord | null | undefined>(undefined);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const { rows, add, update, bestByMovement } = usePersonalRecords();
  const sheetOpen = editing !== undefined;

  const movement = useMemo(() => (id ? getMovement(id) : undefined), [id]);
  const mine = useMemo(
    () => (rows && id ? rows.filter((row) => row.movement_id === id) : []),
    [rows, id],
  );
  const history = useMemo(
    () => (movement ? entriesFor(mine, movement.unit) : []),
    [mine, movement],
  );
  const oneRm = movement?.unit === 'kg' ? history.find((entry) => entry.isPr)?.value : undefined;

  const openCreate = () => setEditing(null);
  const openEdit = (recordId: string) => {
    const row = mine.find((r) => r.id === recordId);
    if (row) setEditing(row);
  };
  const closeSheet = () => setEditing(undefined);

  if (!movement) {
    return (
      <View style={[styles.root, { backgroundColor: c.background, paddingTop: insets.top + Spacing.M }]}>
        <Pressable onPress={() => router.back()} style={styles.backOnly}>
          <AppIcon icon={ChevronLeft} size={22} color={c.text} />
          <Text style={{ color: c.text }}>Retour</Text>
        </Pressable>
        <Text style={[styles.missing, { color: c.muted }]}>Mouvement introuvable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: insets.top + Spacing.S }]}>
        <Pressable
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.sideBtn}>
          <AppIcon icon={ChevronLeft} size={22} color={c.onPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.onPrimary }]} numberOfLines={1}>
          {movement.name}
        </Text>
        <Pressable
          accessibilityLabel="Ajouter une performance"
          hitSlop={8}
          onPress={openCreate}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: c.accent, opacity: pressed ? 0.88 : 1 },
          ]}>
          <AppIcon icon={Plus} size={18} color={c.onAccent} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.XL },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.segment, { backgroundColor: c.raised }]}>
          {(
            [
              { id: 'progression' as const, label: 'Progression' },
              { id: 'percentages' as const, label: 'Pourcentages' },
            ] as const
          ).map((item) => {
            const active = tab === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={[
                  styles.segmentItem,
                  active && { backgroundColor: c.primary },
                ]}>
                <Text
                  style={[
                    styles.segmentTxt,
                    { color: active ? c.onPrimary : c.text },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'progression' ? (
          <>
            <PrProgressChart entries={history} unit={movement.unit} />

            <Text style={[styles.sectionTitle, { color: c.text }]}>
              {historyTitle(movement.unit)}
            </Text>
            <View style={[styles.history, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
              {rows === null ? (
                <ActivityIndicator color={c.primary} style={styles.emptyHist} />
              ) : history.length === 0 ? (
                <Text style={[styles.emptyHist, { color: c.muted }]}>Aucune perf enregistrée</Text>
              ) : (
                history.map((entry, i) => {
                  const last = i === history.length - 1;
                  return (
                    <Pressable
                      key={entry.id}
                      accessibilityRole="button"
                      accessibilityLabel="Modifier la performance"
                      onPress={() => openEdit(entry.id)}
                      style={({ pressed }) => [
                        styles.histRow,
                        !last && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: c.border,
                        },
                        { opacity: pressed ? 0.75 : 1 },
                      ]}>
                      <View style={styles.histLine}>
                        <Text style={[styles.histDate, { color: c.muted }]}>
                          {formatPrDate(entry.date)}
                        </Text>
                        <View style={styles.histRight}>
                          <Text style={[styles.histValue, { color: c.text }]}>
                            {formatPrValue(entry.value, movement.unit)}
                          </Text>
                          {entry.isPr ? (
                            <View style={[styles.prBadge, { backgroundColor: c.accent }]}>
                              <Text style={[styles.prBadgeTxt, { color: c.onAccent }]}>PR</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      {entry.note ? (
                        <Text style={[styles.histNote, { color: c.muted }]}>{entry.note}</Text>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </View>
          </>
        ) : (
          <PrPercentages oneRm={oneRm} unit={movement.unit} />
        )}

        {tab === 'progression' ? (
          <Pressable
            accessibilityRole="button"
            onPress={openCreate}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: c.accent, opacity: pressed ? 0.9 : 1 },
            ]}>
            <AppIcon icon={Plus} size={18} color={c.onAccent} />
            <Text style={[styles.ctaTxt, { color: c.onAccent }]}>Ajouter une performance</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {sheetOpen ? (
        <PrAddSheet
          movement={movement}
          initial={editing}
          onClose={closeSheet}
          onSave={async (input) => {
            const previousBest = bestByMovement[movement.id] ?? 0;
            const err = editing
              ? await update({
                  id: editing.id,
                  value: input.value,
                  note: input.note,
                  performedOn: input.performedOn,
                })
              : await add({
                  movementId: movement.id,
                  value: input.value,
                  note: input.note,
                  performedOn: input.performedOn,
                });
            if (err) return err;

            const badge = getBadge(movement.id);
            if (badge) {
              const nextBest =
                previousBest <= 0
                  ? input.value
                  : higherIsBetter(movement.unit)
                    ? Math.max(previousBest, input.value)
                    : Math.min(previousBest, input.value);
              const unlock = unlockFromPr(previousBest, nextBest, badge.tiers, badge.unit);
              if (unlock) {
                // Après la fermeture animée du sheet (~220 ms) pour éviter 2 Modals empilées.
                setTimeout(() => setCelebration({ badge, unlock }), 280);
              }
            }
            return null;
          }}
        />
      ) : null}

      {celebration ? (
        <BadgeUnlockModal
          badge={celebration.badge}
          unlock={celebration.unlock}
          onClose={() => setCelebration(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.M,
    gap: Spacing.XS,
  },
  sideBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.M,
    gap: Spacing.M,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: BorderRadius.FULL,
    padding: 3,
    gap: 2,
  },
  segmentItem: {
    flex: 1,
    borderRadius: BorderRadius.FULL,
    paddingVertical: Spacing.XS + 2,
    alignItems: 'center',
  },
  segmentTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  sectionTitle: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  history: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    overflow: 'hidden',
  },
  histRow: {
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.S,
    minHeight: 48,
    gap: Spacing.XXS,
  },
  histLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.S,
  },
  histNote: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    lineHeight: 18,
  },
  histDate: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
  histRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  histValue: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ['tabular-nums'],
  },
  prBadge: {
    paddingHorizontal: Spacing.XS + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.FULL,
  },
  prBadgeTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  emptyHist: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    padding: Spacing.L,
  },
  cta: {
    marginTop: Spacing.XS,
    minHeight: Height.PRESSABLE_M,
    borderRadius: BorderRadius.L,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.XS,
  },
  ctaTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  backOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XXS,
    paddingHorizontal: Spacing.M,
    marginBottom: Spacing.M,
  },
  missing: {
    textAlign: 'center',
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
});
