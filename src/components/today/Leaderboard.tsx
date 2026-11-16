import { Flame } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { ChipGroup } from '@/components/Chip';
import { compareScores, showScore } from '@/lib/scoring';
import { BorderRadius, FontSize, FontWeight, Spacing, font, textStyles, tint } from '@/lib/theme';
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
  const t = textStyles(c);
  const [sex, setSex] = useState<'all' | 'F' | 'H'>('all');
  const scoreType = block.score_type;
  const list = useMemo(() => {
    const filtered = (rows || []).filter((r) => sex === 'all' || r.membership?.sex === sex);
    const byScore = compareScores(scoreType);
    return [...filtered].sort((a, b) => {
      const byLevel = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
      return byLevel || byScore(a, b);
    });
  }, [rows, sex, scoreType]);

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
        <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.L }} />
      ) : !list.length ? (
        <Text style={[t.body, styles.empty]}>Aucun score pour l’instant. Sois le premier</Text>
      ) : (
        <View style={[styles.list, { backgroundColor: c.surface, borderColor: c.border }]}>
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
                  isMe && { backgroundColor: tint(c.primary, 0.94, c.background) },
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
                    <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                      {name}
                      {isMe ? ' (toi)' : ''}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: c.raised }]}>
                      <Text style={[styles.tagText, { color: c.muted }]}>{r.level}</Text>
                    </View>
                  </View>
                </View>
                <Text
                  style={[
                    styles.value,
                    { color: c.text, fontFamily: font.semibold, fontVariant: ['tabular-nums'] },
                  ]}>
                  {showScore(scoreType, r.value)}
                </Text>
                {isMe ? (
                  <View style={styles.bumpBtn}>
                    <AppIcon icon={Flame} size={14} color={c.muted} />
                    <Text style={[styles.bumpCount, { color: c.muted }]}>{r.bumps.length}</Text>
                  </View>
                ) : (
                  <Pressable onPress={() => onBump(r)} hitSlop={8} style={styles.bumpBtn}>
                    <AppIcon icon={Flame} size={14} color={bumped ? c.accent : c.muted} />
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
    gap: Spacing.S,
    flex: 1,
  },
  empty: {
    marginTop: Spacing.M,
    textAlign: 'center',
  },
  list: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
  },
  rank: {
    width: 28,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  name: {
    flexShrink: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  tag: {
    paddingHorizontal: Spacing.XS,
    paddingVertical: 2,
    borderRadius: BorderRadius.M,
  },
  tagText: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
  },
  value: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  bumpBtn: {
    minWidth: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bumpCount: {
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    fontVariant: ['tabular-nums'],
  },
});
