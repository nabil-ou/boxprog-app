import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { font, radius, space, type as typeScale } from '@/lib/theme';
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
      <Text style={[styles.label, { color: c.secondary, fontFamily: font.medium }]}>{label}</Text>
      <View>
        <TextInput
          placeholderTextColor={c.muted}
          style={[
            styles.input,
            {
              borderColor: error ? c.danger : c.border,
              color: c.text,
              backgroundColor: c.raised,
              fontFamily: font.regular,
            },
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
    gap: space[2],
  },
  label: {
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.medium,
  },
  input: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    fontSize: typeScale.lg,
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
    fontSize: typeScale.sm,
    lineHeight: 18,
  },
});
