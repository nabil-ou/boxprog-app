import { useFocusEffect } from 'expo-router';
import { Info, MessageCircle } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { AppIcon } from '@/components/AppIcon';
import { BookingRanking } from '@/components/community/BookingRanking';
import { CommunityTabs, type CommunityTab } from '@/components/community/CommunityTabs';
import { MyRankCard } from '@/components/community/MyRankCard';
import { RankPodium } from '@/components/community/RankPodium';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { SelectMenu } from '@/components/SelectMenu';
import {
  loadRanks,
  loadSessionStats,
  monthOptions,
  podiumTitle,
  yearOptions,
  type RankEntry,
  type RankPeriod,
} from '@/lib/bookingStats';
import { errMsg } from '@/lib/supabase';
import { Spacing, textStyles } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

type Kind = RankPeriod['kind'];

const KINDS: { value: Kind; label: string }[] = [
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
  { value: 'all', label: 'Depuis toujours' },
];

export default function CommunityScreen() {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<CommunityTab>('ranking');

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Communauté" onOpenMenu={() => setDrawerOpen(true)} />
      <CommunityTabs value={tab} onChange={setTab} />
      {tab === 'ranking' ? (
        <RankingTab boxId={box.id} />
      ) : (
        <View style={[styles.discussion, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}>
          <EmptyState
            icon={MessageCircle}
            title="Discussion à venir"
            body={`Bientôt : échange avec les membres de ${box.name}.`}
          />
        </View>
      )}
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

function RankingTab({ boxId }: { boxId: string }) {
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [kind, setKind] = useState<Kind>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [since, setSince] = useState<string | null>(null);
  const [rows, setRows] = useState<RankEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(0);

  const period = useMemo<RankPeriod>(
    () => (kind === 'all' ? { kind } : kind === 'year' ? { kind, year } : { kind, year, month }),
    [kind, year, month],
  );

  const load = useCallback(async () => {
    const id = ++request.current;
    try {
      const next = await loadRanks(boxId, period);
      if (id !== request.current) return;
      setRows(next);
      setError(null);
    } catch (e) {
      if (id === request.current) setError(errMsg(e));
    }
  }, [boxId, period]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      loadSessionStats(boxId).then(
        (s) => setSince(s.since),
        () => undefined,
      );
    }, [boxId]),
  );

  const reset = () => {
    setRows(null);
    setError(null);
  };

  const changeKind = (next: Kind) => {
    const today = new Date();
    reset();
    setKind(next);
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const months = useMemo(() => monthOptions(since), [since]);
  const years = useMemo(() => yearOptions(since), [since]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const showInfo = () =>
    Alert.alert(
      'Comment c’est compté',
      'Une séance compte quand ta réservation est confirmée et que le cours a commencé. La liste d’attente ne compte pas.',
    );

  const podiumCount = rows ? Math.min(3, rows.filter((r) => r.sessions > 0).length) : 0;
  const top = rows ? [0, 1, 2].map((i) => (i < podiumCount ? rows[i] : null)) : [];
  const rest = rows ? rows.slice(podiumCount) : [];
  const me = rows?.find((r) => r.isMe);

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />}
      showsVerticalScrollIndicator={false}>
      <View style={styles.filters}>
        {kind === 'month' ? (
          <SelectMenu
            title="Mois"
            label={months.find((m) => m.year === year && m.month === month)?.label ?? ''}
            options={months.map((m) => ({ value: `${m.year}-${m.month}`, label: m.label }))}
            value={`${year}-${month}`}
            onChange={(v) => {
              const [y, m] = v.split('-').map(Number);
              reset();
              setYear(y);
              setMonth(m);
            }}
          />
        ) : kind === 'year' ? (
          <SelectMenu
            title="Année"
            label={String(year)}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            value={String(year)}
            onChange={(v) => {
              reset();
              setYear(Number(v));
            }}
          />
        ) : null}
        <SelectMenu
          title="Période"
          label={KINDS.find((k) => k.value === kind)?.label ?? ''}
          options={KINDS}
          value={kind}
          onChange={changeKind}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Comment c’est compté"
          hitSlop={10}
          onPress={showInfo}
          style={styles.info}>
          <AppIcon icon={Info} size={24} color={c.text} />
        </Pressable>
      </View>

      {error ? (
        <Text style={[t.body, styles.center, { color: c.danger }]}>{error}</Text>
      ) : !rows ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.L }} />
      ) : (
        <>
          <RankPodium title={podiumTitle(period)} top={top} />
          {me ? <MyRankCard entry={me} /> : null}
          <BookingRanking rows={rest} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: Spacing.M,
    gap: Spacing.M,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  info: {
    marginLeft: 'auto',
  },
  center: {
    marginTop: Spacing.M,
    textAlign: 'center',
  },
  discussion: {
    flex: 1,
    padding: Spacing.M,
    justifyContent: 'center',
  },
});
