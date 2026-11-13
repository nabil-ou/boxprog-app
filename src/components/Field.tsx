import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  /** Message d'erreur affiché sous le champ, à la place de l'aide. */
  error?: string | null;
  /** Bouton posé à droite dans le champ. */
  right?: ReactNode;
}

export function Field({ label, hint, error, right, style, ...input }: FieldProps) {
  const c = useBrand();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <View>
        <TextInput
          placeholderTextColor={c.muted}
          style={[
            styles.input,
            { borderColor: error ? c.danger : c.border, color: c.text, backgroundColor: c.surface },
            right ? styles.withRight : null,
            style,
          ]}
          {...input}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? (
        <Text style={[styles.hint, { color: c.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: c.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  withRight: {
    paddingRight: 52,
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
