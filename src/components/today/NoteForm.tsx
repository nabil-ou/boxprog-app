import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { LevelChips } from '@/components/today/LevelChips';
import { fmtDateTime } from '@/lib/dates';
import { decodeScore, encodeScore } from '@/lib/scoring';
import { errMsg, supabase } from '@/lib/supabase';
import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { FEEDBACK_MAX, boxLevel, type Block, type Feedback, type Level, type ScoreRow } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

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
  const box = useActiveBox();
  const eliteLevel = box.elite_level;
  const { session } = useAuth();
  const scored = Boolean(block.score_type);
  const t = block.score_type;
  const [level, setLevel] = useState<Level>(boxLevel(box, mineScore?.level ?? initialLevel));
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
    setLevel(boxLevel({ elite_level: eliteLevel }, mineScore.level));
  }, [mineScore, t, eliteLevel]);

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
          <Text style={[styles.eyebrow, { color: c.muted, fontFamily: font.medium }]}>Niveau</Text>
          <LevelChips value={level} onChange={setLevel} />
        </>
      ) : null}

      {withFeedback ? (
        <View style={styles.feedback}>
          {scored ? <View style={[styles.sep, { backgroundColor: c.border }]} /> : null}
          <Text style={[styles.label, { color: c.secondary, fontFamily: font.medium }]}>Mon retour</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={FEEDBACK_MAX}
            placeholder="Sensations, charge utilisée, douleur, difficulté…"
            placeholderTextColor={c.muted}
            style={[
              styles.input,
              {
                borderColor: c.border,
                color: c.text,
                backgroundColor: c.surface,
                fontFamily: font.regular,
              },
            ]}
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
    gap: Spacing.S,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.S,
  },
  flex: {
    flex: 1,
  },
  eyebrow: {
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  feedback: {
    gap: Spacing.S,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  input: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.S,
    fontSize: FontSize.S,
    lineHeight: 20,
  },
  hint: {
    fontSize: FontSize.XS,
    lineHeight: 16,
  },
});
