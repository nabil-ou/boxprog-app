import { useState } from 'react';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { FormError } from '@/components/FormError';
import { PASSWORD_MIN, PasswordField } from '@/components/PasswordField';
import { errMsg, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function NewPasswordScreen() {
  const { finishRecovery, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && !password.startsWith(confirm);
  const ready = password.length >= PASSWORD_MIN && confirm === password;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(errMsg(error));
    else finishRecovery();
  };

  return (
    <BrandScreen title="Nouveau mot de passe" subtitle="Choisis le mot de passe que tu utiliseras pour te connecter.">
      <PasswordField
        label="Nouveau mot de passe"
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
        returnKeyType="done"
        onSubmitEditing={() => ready && submit()}
      />
      <FormError message={error} />
      <Button label="Enregistrer" onPress={submit} busy={busy} disabled={!ready} />
      <Button label="Annuler" variant="ghost" onPress={signOut} />
    </BrandScreen>
  );
}
