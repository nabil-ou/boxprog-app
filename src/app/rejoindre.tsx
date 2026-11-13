import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandScreen } from '@/components/BrandScreen';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { BOX_SLUG } from '@/config/box';
import { errMsg, supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useBox, useBrand } from '@/providers/BoxProvider';

/** « Léa Martin » → « Léa M. », comme sur le site. */
function shortName(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w : w[0] + '.'))
    .join(' ');
}

const SEXES = [
  ['F', 'Femme'],
  ['H', 'Homme'],
] as const;

export default function JoinScreen() {
  const { session, signOut } = useAuth();
  const { box, reload } = useBox();
  const c = useBrand();
  const [code, setCode] = useState('');
  const [name, setName] = useState(shortName((session?.user.user_metadata?.full_name as string) || ''));
  const [sex, setSex] = useState<'F' | 'H' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc('join_box', {
      p_slug: BOX_SLUG,
      p_code: code.trim(),
      p_display_name: name.trim(),
      p_sex: sex,
    });
    if (error) {
      setBusy(false);
      setError(errMsg(error));
      return;
    }
    await reload();
  };

  return (
    <BrandScreen
      title={`Rejoindre ${box?.name ?? 'la box'}`}
      subtitle="Le code d’accès t’est donné par la box, à l’accueil ou par message.">
      <Field
        label="Code d’accès"
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        style={styles.code}
      />
      <Field
        label="Nom affiché"
        hint="Visible des autres adhérents dans les classements."
        value={name}
        onChangeText={setName}
        maxLength={40}
        placeholder="Léa M."
      />
      <View style={styles.sexes}>
        {SEXES.map(([value, label]) => {
          const on = sex === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setSex(on ? null : value)}
              style={[styles.chip, { borderColor: on ? c.ink : c.border, backgroundColor: on ? c.ink : c.surface }]}>
              <Text style={{ color: on ? '#FFFFFF' : c.text, fontWeight: '600' }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <FormError message={error} />
      <Button label="Rejoindre la box" onPress={submit} busy={busy} disabled={!code.trim() || !name.trim()} />
      <Button label="Se déconnecter" variant="ghost" onPress={signOut} />
    </BrandScreen>
  );
}

const styles = StyleSheet.create({
  code: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
  },
  sexes: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
