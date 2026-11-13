import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { PASSWORD_MIN, PasswordField } from '@/components/PasswordField';
import { errMsg, supabase } from '@/lib/supabase';
import { authRedirect } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function SignUpScreen() {
  const c = useBrand();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const mismatch = confirm.length > 0 && !password.startsWith(confirm);
  const ready = firstName.trim() && lastName.trim() && email.trim() && password.length >= PASSWORD_MIN && confirm === password;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: authRedirect('/') },
    });
    setBusy(false);
    if (error) setError(errMsg(error));
    // Avec une session, la garde du layout racine ouvre l'écran d'adhésion.
    else if (!data.session) setConfirmSent(true);
  };

  if (confirmSent) {
    return (
      <BrandScreen title="Vérifie tes e-mails">
        <Text style={[styles.text, { color: c.muted }]}>
          Un lien de confirmation a été envoyé à {email.trim()}. Ouvre-le, puis reviens te connecter.
        </Text>
        <Button label="Retour à la connexion" onPress={() => router.replace('/connexion')} />
      </BrandScreen>
    );
  }

  return (
    <BrandScreen title="Créer mon compte" subtitle="Tu rejoindras la box juste après, avec son code d’accès.">
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Prénom" value={firstName} onChangeText={setFirstName} autoComplete="given-name" textContentType="givenName" />
        </View>
        <View style={styles.flex}>
          <Field label="Nom" value={lastName} onChangeText={setLastName} autoComplete="family-name" textContentType="familyName" />
        </View>
      </View>
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <PasswordField
        label="Mot de passe"
        hint={`${PASSWORD_MIN} caractères minimum.`}
        value={password}
        onChangeText={setPassword}
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
      />
      <FormError message={error} />
      <Button label="Créer mon compte" onPress={submit} busy={busy} disabled={!ready} />
      <Button label="J’ai déjà un compte" variant="ghost" onPress={() => router.back()} />
    </BrandScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
  },
});
