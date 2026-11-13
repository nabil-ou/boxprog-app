import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { PasswordField } from '@/components/PasswordField';
import { errMsg, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function SignInScreen() {
  const c = useBrand();
  const { linkError, clearLinkError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    clearLinkError();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError(errMsg(error));
  };

  return (
    <BrandScreen title="Connexion" subtitle="Retrouve ta séance du jour, les actus de la box et tes records.">
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
        returnKeyType="next"
      />
      <PasswordField
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push({ pathname: '/mot-de-passe-oublie', params: { email: email.trim() } })}
        style={styles.forgot}>
        <Text style={[styles.forgotText, { color: c.ink }]}>Mot de passe oublié ?</Text>
      </Pressable>
      <FormError message={error ?? linkError} />
      <Button label="Se connecter" onPress={submit} busy={busy} disabled={!email.trim() || !password} />
      <Button label="Créer mon compte" variant="ghost" onPress={() => router.push('/inscription')} />
    </BrandScreen>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
