import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FormError } from '@/components/FormError';
import { PASSWORD_MIN, PasswordField } from '@/components/PasswordField';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { errMsg, supabase } from '@/lib/supabase';
import { Spacing } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function PasswordScreen() {
  const { session } = useAuth();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && !next.startsWith(confirm);
  const same = next.length > 0 && next === current;
  const ready = current.length > 0 && next.length >= PASSWORD_MIN && confirm === next && next !== current;

  const submit = async () => {
    const email = session?.user.email;
    if (!email || !ready) return;
    setBusy(true);
    setError(null);
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signError) {
      setBusy(false);
      setError(errMsg(signError));
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateError) setError(errMsg(updateError));
    else router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Mot de passe" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <PasswordField
          label="Mot de passe actuel"
          value={current}
          onChangeText={setCurrent}
          autoComplete="current-password"
          textContentType="password"
        />
        <PasswordField
          label="Nouveau mot de passe"
          hint={`${PASSWORD_MIN} caractères minimum.`}
          value={next}
          onChangeText={setNext}
          error={same ? 'Choisis un mot de passe différent de l’actuel.' : null}
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <PasswordField
          label="Confirme le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          error={mismatch ? 'Les mots de passe ne correspondent pas.' : null}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => ready && submit()}
        />
        <FormError message={error} />
        <Button label="Enregistrer" onPress={submit} busy={busy} disabled={!ready} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.M, gap: Spacing.M },
});
