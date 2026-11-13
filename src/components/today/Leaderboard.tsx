import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { LevelChips } from '@/components/today/LevelChips';
import { compareScores, showScore } from '@/lib/scoring';
import type { Block, Level, ScoreRow } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

export function Leaderboard({
  block,
  rows,
  me,
  onBump,
  level,
  setLevel,
}: {
  block: Block;
  rows: ScoreRow[] | null;
  me: string;
  onBump: (r: ScoreRow) => void;
  level: Level;
  setLevel: (l: Level) => void;
}) {
  const c = useBrand();
  const [sex, setSex] = useState<'all' | 'F' | 'H'>('all');
  const t = block.score_type;
  const list = useMemo(
    () =>
      (rows || [])
        .filter((r) => r.level === level && (sex === 'all' || r.membership?.sex === sex))
        .sort(compareScores(t)),
    [rows, level, sex, t],
  );

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>Leaderboard</Text>
      <LevelChips value={level} onChange={setLevel} />
      <View style={styles.filters}>
        {([
          ['all', 'Tous'],
          ['F', 'Femmes'],
          ['H', 'Hommes'],
        ] as const).map(([k, label]) => {
          const on = sex === k;
          return (
            <Pressable
              key={k}
              onPress={() => setSex(k)}
              style={[
                styles.chip,
                { backgroundColor: on ? c.primary : c.background, borderColor: on ? c.primary : c.border },
              ]}>
              <Text style={{ color: on ? c.onPrimary : c.text, fontWeight: '700', fontSize: 14 }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      {!rows ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 24 }} />
      ) : !list.length ? (
        <Text style={[styles.empty, { color: c.muted }]}>Aucun score {level} pour l’instant. Sois le premier !</Text>
      ) : (
        <View style={styles.list}>
          {list.map((r, i) => {
            const isMe = r.user_id === me;
            const bumped = r.bumps.some((x) => x.user_id === me);
            const name = r.membership?.display_name || 'Adhérent';
            return (
              <View
                key={r.id}
                style={[
                  styles.row,
                  { backgroundColor: isMe ? mixSoft(c.primary) : c.background, borderColor: c.border },
                ]}>
                <Text style={[styles.rank, { color: i === 0 ? c.accent : c.muted }]}>{i + 1}</Text>
                <View style={styles.meta}>
                  <Text style={[styles.name, { color: c.text }]}>
                    {name}
                    {isMe ? ' (toi)' : ''}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 13 }}>{r.level}</Text>
                </View>
                <Text style={[styles.value, { color: c.text }]}>{showScore(t, r.value)}</Text>
                {isMe ? (
                  <Text style={[styles.bump, { color: c.muted }]}>🔥 {r.bumps.length}</Text>
                ) : (
                  <Pressable onPress={() => onBump(r)} hitSlop={8} style={styles.bumpBtn}>
                    <Text style={{ color: bumped ? c.accent : c.muted, fontWeight: '700' }}>🔥 {r.bumps.length}</Text>
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

function mixSoft(hex: string) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#F3F4F6';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (v: number) => Math.round(v * 0.1 + 255 * 0.9);
  return `#${[r, g, b].map((v) => mix(v).toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rank: {
    width: 28,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  bump: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  bumpBtn: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
