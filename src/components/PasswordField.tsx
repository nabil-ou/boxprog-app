import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Field, type FieldProps } from '@/components/Field';
import { symbol } from '@/lib/symbols';
import { useBrand } from '@/providers/BoxProvider';

export const PASSWORD_MIN = 8;

export function PasswordField(props: Omit<FieldProps, 'secureTextEntry' | 'right'>) {
  const c = useBrand();
  const [shown, setShown] = useState(false);

  return (
    <Field
      {...props}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          onPress={() => setShown((s) => !s)}
          hitSlop={6}
          style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.6 : 1 }]}>
          <SymbolView
            name={shown ? symbol('eye.slash', 'visibility_off') : symbol('eye', 'visibility')}
            size={22}
            tintColor={c.muted}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
