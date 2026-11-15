import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { BorderRadius, FontSize, FontWeight, Height, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
  right?: ReactNode;
}

export function Field({ label, hint, error, right, style, ...input }: FieldProps) {
  const c = useBrand();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text, fontFamily: font.medium }]}>{label}</Text>
      <View>
        <TextInput
          placeholderTextColor={c.muted}
          style={[
            styles.input,
            {
              borderColor: error ? c.danger : c.border,
              color: c.text,
              backgroundColor: c.surface,
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
    gap: Spacing.XS,
  },
  label: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  input: {
    minHeight: Height.INPUT_S,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    fontSize: FontSize.S,
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
    fontSize: FontSize.XS,
    lineHeight: 16,
  },
});
