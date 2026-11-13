import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { LevelChips } from '@/components/today/LevelChips';
import { fmtDateTime } from '@/lib/dates';
import { decodeScore, encodeScore } from '@/lib/scoring';
import { errMsg, supabase } from '@/lib/supabase';
import { FEEDBACK_MAX, type Block, type Feedback, type Level, type ScoreRow } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export function NoteForm({
  block,
  mineScore,
  mineFeedback,
  initialLevel,
  withFeedback,
  onSaved,
}: {
  block: Block;
  mineScore?: ScoreRow;
  mineFeedback?: Feedback;
  initialLevel: Level;
  withFeedback: boolean;
  onSaved: (next: { score?: ScoreRow; feedback?: Feedback | null }) => void;
}) {
  const c = useBrand();
  const { session } = useAuth();
  const scored = Boolean(block.score_type);
  const t = block.score_type;
  const [level, setLevel] = useState<Level>(mineScore?.level ?? initialLevel);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [body, setBody] = useState(mineFeedback?.body || '');
  const [fb, setFb] = useState(mineFeedback);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mineScore || !t) return;
    const [x, y] = decodeScore(t, mineScore.value);
    setA(String(x));
    setB(t === 'load' ? '' : String(y));
    setLevel(mineScore.level);
  }, [mineScore, t]);

  useEffect(() => {
    setFb(mineFeedback);
    setBody(mineFeedback?.body || '');
  }, [mineFeedback]);

  const labels =
    t === 'rounds' ? ['Rounds', 'Reps en plus'] : t === 'time' ? ['Minutes', 'Secondes'] : t === 'load' ? ['Score (kg ou reps)'] : [];

  const hasExisting = Boolean(mineScore || fb);
  const buttonLabel = hasExisting ? 'Mettre à jour' : 'Enregistrer';

  const submit = async () => {
    const uid = session!.user.id;
    const text = body.trim();
    let scoreValue = 0;

    if (scored) {
      scoreValue = encodeScore(t, +a || 0, +b || 0);
      if (!scoreValue) {
        setError('Entre un score avant de valider');
        return;
      }
    } else if (withFeedback && !text) {
      setError('Écris ton retour avant de valider');
      return;
    }

    if (!scored && !withFeedback) return;

    setBusy(true);
    setError(null);

    let nextScore: ScoreRow | undefined;
    let nextFeedback: Feedback | null | undefined;

    if (scored) {
      const { error: scoreErr } = await supabase
        .from('scores')
        .upsert({ block_id: block.id, user_id: uid, level, value: scoreValue }, { onConflict: 'block_id,user_id' });
      if (scoreErr) {
        setBusy(false);
        setError(errMsg(scoreErr));
        return;
      }
      nextScore = {
        id: mineScore?.id || '',
        block_id: block.id,
        user_id: uid,
        level,
        value: scoreValue,
        membership: mineScore?.membership ?? null,
        bumps: mineScore?.bumps ?? [],
      };
    }

    if (withFeedback && text) {
      const { data, error: fbErr } = await supabase
        .from('feedbacks')
        .upsert({ block_id: block.id, user_id: uid, body: text }, { onConflict: 'block_id,user_id' })
        .select('id, block_id, user_id, body, created_at, updated_at')
        .single();
      if (fbErr) {
        setBusy(false);
        setError(errMsg(fbErr));
        if (nextScore) onSaved({ score: nextScore });
        return;
      }
      nextFeedback = data as Feedback;
      setFb(nextFeedback);
    }

    setBusy(false);
    onSaved({ score: nextScore, feedback: nextFeedback });
  };

  const removeFeedback = async () => {
    if (!fb) return;
    setBusy(true);
    setError(null);
    const { error: delErr } = await supabase.from('feedbacks').delete().eq('id', fb.id);
    setBusy(false);
    if (delErr) {
      setError(errMsg(delErr));
      return;
    }
    setBody('');
    setFb(undefined);
    onSaved({ feedback: null });
  };

  return (
    <View style={styles.wrap}>
      {scored ? (
        <>
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
        </>
      ) : null}

      {withFeedback ? (
        <View style={styles.feedback}>
          {scored ? <View style={[styles.sep, { backgroundColor: c.border }]} /> : null}
          <Text style={[styles.label, { color: c.text }]}>Mon retour</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={FEEDBACK_MAX}
            placeholder="Sensations, charge utilisée, douleur, difficulté…"
            placeholderTextColor={c.muted}
            style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
            textAlignVertical="top"
          />
          <Text style={[styles.hint, { color: c.muted }]}>
            Visible uniquement par tes coachs.
            {fb ? ` Envoyé ${fmtDateTime(fb.created_at)}.` : scored ? ' Optionnel.' : ''}
          </Text>
        </View>
      ) : null}

      <FormError message={error} />
      <Button label={buttonLabel} onPress={submit} busy={busy} />
      {fb ? <Button label="Supprimer mon retour" variant="ghost" onPress={removeFeedback} disabled={busy} /> : null}
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
  feedback: {
    gap: 12,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
