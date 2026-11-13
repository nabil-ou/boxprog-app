import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Leaderboard } from '@/components/today/Leaderboard';
import { useBlockScores } from '@/hooks/useBlockScores';
import { blockSubtitle, blockTitle } from '@/lib/scoring';
import { supabase } from '@/lib/supabase';
import type { Block } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function ScoresScreen() {
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const box = useActiveBox();
  const c = useBrand();
  const [block, setBlock] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error: err } = await supabase.from('blocks').select('*').eq('id', blockId).maybeSingle();
      if (!alive) return;
      if (err) {
        setError(err.message);
        setBlock(null);
        return;
      }
      if (!data || !(data as Block).score_type) {
        setError('Bloc introuvable.');
        setBlock(null);
        return;
      }
      setError(null);
      setBlock(data as Block);
    })();
    return () => {
      alive = false;
    };
  }, [blockId]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen
        options={{
          title: block ? blockTitle(block) : 'Scores',
          headerStyle: { backgroundColor: c.primary },
          headerTintColor: c.onPrimary,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      {!block && !error ? (
        <ActivityIndicator color={c.primary} style={styles.spinner} />
      ) : error || !block ? (
        <Text style={[styles.empty, { color: c.danger }]}>{error || 'Bloc introuvable.'}</Text>
      ) : (
        <ScoresBody block={block} boxId={box.id} />
      )}
    </View>
  );
}

function ScoresBody({ block, boxId }: { block: Block; boxId: string }) {
  const c = useBrand();
  const { rows, me, toggleBump } = useBlockScores(block, boxId);
  const sub = block.timer_format ? blockSubtitle(block) : '';

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {sub ? <Text style={[styles.sub, { color: c.muted }]}>{sub}</Text> : null}
      <Text style={[styles.heading, { color: c.text }]}>Leaderboard</Text>
      <Leaderboard block={block} rows={rows} me={me} onBump={toggleBump} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  spinner: {
    marginTop: 40,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 16,
  },
  body: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  sub: {
    fontSize: 14,
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
});
