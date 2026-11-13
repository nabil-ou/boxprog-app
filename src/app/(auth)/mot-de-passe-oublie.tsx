import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { errMsg, supabase } from '@/lib/supabase';
import { authRedirect } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function ForgotPasswordScreen() {
  const c = useBrand();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirect('/nouveau-mot-de-passe'),
    });
    setBusy(false);
    if (error) setError(errMsg(error));
    else setSent(true);
  };

  if (sent) {
    return (
      <BrandScreen title="Vérifie tes e-mails">
        <Text style={[styles.text, { color: c.muted }]}>
          Si un compte existe pour {email.trim()}, un lien de réinitialisation vient d’être envoyé. Ouvre-le sur ce
          téléphone pour choisir un nouveau mot de passe.
        </Text>
        <Button label="Retour à la connexion" onPress={() => router.back()} />
      </BrandScreen>
    );
  }

  return (
    <BrandScreen title="Mot de passe oublié" subtitle="Entre ton e-mail, on t’envoie un lien pour le réinitialiser.">
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
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <FormError message={error} />
      <Button label="Envoyer le lien" onPress={submit} busy={busy} disabled={!email.trim()} />
      <Button label="Retour à la connexion" variant="ghost" onPress={() => router.back()} />
    </BrandScreen>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 23,
  },
});
