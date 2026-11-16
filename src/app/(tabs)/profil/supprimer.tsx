import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { errMsg, supabase } from '@/lib/supabase';
import { BorderRadius, FontSize, Spacing, font, softShadow } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

const CONFIRM = 'SUPPRIMER';

export default function DeleteAccountScreen() {
  const { session, signOut } = useAuth();
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = typed.trim().toUpperCase() === CONFIRM;
  const email = session?.user.email ?? '';

  const submit = async () => {
    const userId = session?.user.id;
    if (!userId || !match) return;
    setBusy(true);
    setError(null);
    const { data: files } = await supabase.storage.from('avatars').list(userId);
    if (files?.length) await supabase.storage.from('avatars').remove(files.map((file) => `${userId}/${file.name}`));
    const { error: rpcError } = await supabase.rpc('delete_my_account');
    if (rpcError) {
      setBusy(false);
      setError(errMsg(rpcError));
      return;
    }
    await signOut();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Supprimer le compte" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
          <Text style={[styles.lead, { color: c.text }]}>{email}</Text>
          {box.my_role === 'owner' ? (
            <Text style={[styles.body, { color: c.muted }]}>
              Tu es propriétaire de {box.name}. Transfère-la ou supprime-la d’abord.
            </Text>
          ) : (
            <Text style={[styles.body, { color: c.muted }]}>
              Ton compte, ta photo, tes scores et tes adhésions à toutes tes box sont effacés définitivement.
            </Text>
          )}
          <Text style={[styles.body, { color: c.text }]}>Tape {CONFIRM} pour confirmer.</Text>
        </View>
        <Field
          label="Confirmation"
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
        />
        <FormError message={error} />
        <Button label="Supprimer définitivement" onPress={submit} busy={busy} disabled={!match} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.M, gap: Spacing.M },
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.M,
    gap: Spacing.S,
  },
  lead: { fontFamily: font.medium, fontSize: FontSize.S },
  body: { fontFamily: font.regular, fontSize: FontSize.S, lineHeight: 22 },
});
