import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { font, radius, space, type as typeScale } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  busy?: boolean;
  disabled?: boolean;
  /** Bouton posé sur la couleur principale (écrans de connexion). */
  onBrand?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', busy, disabled, onBrand, style }: Props) {
  const c = useBrand();
  const primary = variant === 'primary';
  const bg = primary ? c.accent : 'transparent';
  const fg = primary ? c.onAccent : onBrand ? c.onPrimary : c.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg, fontFamily: font.medium }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: space[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typeScale.lg,
    fontWeight: typeScale.weight.medium,
  },
});
