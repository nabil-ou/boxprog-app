import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChipGroup } from '@/components/Chip';
import { compareScores, showScore } from '@/lib/scoring';
import { font, radius, space, tint, type as typeScale } from '@/lib/theme';
import type { Block, Level, ScoreRow } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

const LEVEL_ORDER: Record<Level, number> = { RX: 0, Inter: 1, Scaled: 2 };

export function Leaderboard({
  block,
  rows,
  me,
  onBump,
}: {
  block: Block;
  rows: ScoreRow[] | null;
  me: string;
  onBump: (r: ScoreRow) => void;
}) {
  const c = useBrand();
  const [sex, setSex] = useState<'all' | 'F' | 'H'>('all');
  const t = block.score_type;
  const list = useMemo(() => {
    const filtered = (rows || []).filter((r) => sex === 'all' || r.membership?.sex === sex);
    const byScore = compareScores(t);
    return [...filtered].sort((a, b) => {
      const byLevel = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
      return byLevel || byScore(a, b);
    });
  }, [rows, sex, t]);

  const ranks = useMemo(() => {
    const map = new Map<string, number>();
    const count: Record<Level, number> = { RX: 0, Inter: 0, Scaled: 0 };
    for (const r of list) {
      count[r.level] += 1;
      map.set(r.id, count[r.level]);
    }
    return map;
  }, [list]);

  return (
    <View style={styles.wrap}>
      <ChipGroup
        options={[
          { value: 'all' as const, label: 'Tous' },
          { value: 'F' as const, label: 'Femmes' },
          { value: 'H' as const, label: 'Hommes' },
        ]}
        value={sex}
        onChange={setSex}
      />
      {!rows ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: space[6] }} />
      ) : !list.length ? (
        <Text style={[styles.empty, { color: c.muted }]}>Aucun score pour l’instant. Sois le premier</Text>
      ) : (
        <View style={styles.list}>
          {list.map((r, i) => {
            const isMe = r.user_id === me;
            const bumped = r.bumps.some((x) => x.user_id === me);
            const name = r.membership?.display_name || 'Adhérent';
            const rank = ranks.get(r.id) ?? 0;
            return (
              <View
                key={r.id}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
                  isMe && { backgroundColor: tint(c.primary, 0.92) },
                ]}>
                <Text
                  style={[
                    styles.rank,
                    {
                      color: rank === 1 ? c.accent : c.muted,
                      fontFamily: font.semibold,
                      fontVariant: ['tabular-nums'],
                    },
                  ]}>
                  {rank}
                </Text>
                <View style={styles.meta}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: c.text, fontFamily: font.medium }]} numberOfLines={1}>
                      {name}
                      {isMe ? ' (toi)' : ''}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: c.raised }]}>
                      <Text style={[styles.tagText, { color: c.secondary, fontFamily: font.medium }]}>{r.level}</Text>
                    </View>
                  </View>
                </View>
                <Text
                  style={[
                    styles.value,
                    { color: c.text, fontFamily: font.semibold, fontVariant: ['tabular-nums'] },
                  ]}>
                  {showScore(t, r.value)}
                </Text>
                {isMe ? (
                  <View style={styles.bumpBtn}>
                    <Ionicons name="flame-outline" size={16} color={c.muted} />
                    <Text style={[styles.bumpCount, { color: c.muted }]}>{r.bumps.length}</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => onBump(r)} hitSlop={8} style={styles.bumpBtn}>
                    <Ionicons name="flame-outline" size={16} color={bumped ? c.accent : c.muted} />
                    <Text style={[styles.bumpCount, { color: bumped ? c.accent : c.muted }]}>{r.bumps.length}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space[3],
    flex: 1,
  },
  empty: {
    marginTop: space[4],
    textAlign: 'center',
    fontSize: typeScale.md,
    lineHeight: 22,
  },
  list: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
    paddingHorizontal: space[3],
  },
  rank: {
    width: 28,
    fontSize: typeScale.lg,
    fontWeight: typeScale.weight.semibold,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  name: {
    flexShrink: 1,
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.medium,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: typeScale.weight.medium,
  },
  value: {
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.semibold,
  },
  bumpBtn: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bumpCount: {
    fontSize: typeScale.sm,
    fontWeight: typeScale.weight.medium,
    fontVariant: ['tabular-nums'],
  },
});
