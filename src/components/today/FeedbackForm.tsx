import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormError } from '@/components/FormError';
import { fmtDateTime } from '@/lib/dates';
import { errMsg, supabase } from '@/lib/supabase';
import { FEEDBACK_MAX, type Block, type Feedback } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export function FeedbackForm({
  block,
  mine,
  onSaved,
}: {
  block: Block;
  mine?: Feedback;
  onSaved: (f: Feedback | null) => void;
}) {
  const c = useBrand();
  const { session } = useAuth();
  const [body, setBody] = useState(mine?.body || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const text = body.trim();
    if (!text) {
      setError('Écris ton retour avant de valider');
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from('feedbacks')
      .upsert({ block_id: block.id, user_id: session!.user.id, body: text }, { onConflict: 'block_id,user_id' })
      .select('id, block_id, user_id, body, created_at, updated_at')
      .single();
    setBusy(false);
    if (error) setError(errMsg(error));
    else onSaved(data as Feedback);
  };

  const remove = async () => {
    if (!mine) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from('feedbacks').delete().eq('id', mine.id);
    setBusy(false);
    if (error) setError(errMsg(error));
    else {
      setBody('');
      onSaved(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text }]}>Mon retour</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={FEEDBACK_MAX}
        placeholder="Sensations, charge utilisée, douleur, difficulté…"
        placeholderTextColor={c.muted}
        style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.surface }]}
        textAlignVertical="top"
      />
      <Text style={[styles.hint, { color: c.muted }]}>
        Visible uniquement par tes coachs.
        {mine ? ` Envoyé ${fmtDateTime(mine.created_at)}.` : ''}
      </Text>
      <FormError message={error} />
      <Button label={mine ? 'Mettre à jour' : 'Envoyer'} onPress={submit} busy={busy} />
      {mine ? <Button label="Supprimer mon retour" variant="ghost" onPress={remove} disabled={busy} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
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
