import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { LevelChips } from '@/components/today/LevelChips';
import { decodeScore, encodeScore } from '@/lib/scoring';
import { errMsg, supabase } from '@/lib/supabase';
import type { Block, Level, ScoreRow } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export function ScoreForm({
  block,
  mine,
  initialLevel,
  onSaved,
}: {
  block: Block;
  mine?: ScoreRow;
  initialLevel: Level;
  onSaved: (level: Level, value: number) => void;
}) {
  const c = useBrand();
  const { session } = useAuth();
  const [level, setLevel] = useState<Level>(mine?.level ?? initialLevel);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = block.score_type;

  useEffect(() => {
    if (!mine) return;
    const [x, y] = decodeScore(t, mine.value);
    setA(String(x));
    setB(t === 'load' ? '' : String(y));
    setLevel(mine.level);
  }, [mine, t]);

  const labels =
    t === 'rounds' ? ['Rounds', 'Reps en plus'] : t === 'time' ? ['Minutes', 'Secondes'] : ['Score (kg ou reps)'];

  const submit = async () => {
    const value = encodeScore(t, +a || 0, +b || 0);
    if (!value) {
      setError('Entre un score avant de valider');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from('scores')
      .upsert({ block_id: block.id, user_id: session!.user.id, level, value }, { onConflict: 'block_id,user_id' });
    setBusy(false);
    if (error) setError(errMsg(error));
    else onSaved(level, value);
  };

  return (
    <View style={styles.wrap}>
      <View style={labels.length === 2 ? styles.grid : undefined}>
        <View style={styles.flex}>
          <Field label={labels[0]} value={a} onChangeText={setA} keyboardType="number-pad" />
        </View>
        {labels[1] ? (
          <View style={styles.flex}>
            <Field label={labels[1]} value={b} onChangeText={setB} keyboardType="number-pad" />
          </View>
        ) : null}
      </View>
      <Text style={[styles.eyebrow, { color: c.muted }]}>Niveau</Text>
      <LevelChips value={level} onChange={setLevel} />
      <FormError message={error} />
      <Button label={mine ? 'Mettre à jour' : 'Valider'} onPress={submit} busy={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
