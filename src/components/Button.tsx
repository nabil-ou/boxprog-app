import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { BorderRadius, FontSize, FontWeight, Height, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  busy?: boolean;
  disabled?: boolean;
  onBrand?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', busy, disabled, onBrand, style }: Props) {
  const c = useBrand();
  const primary = variant === 'primary';
  const outline = variant === 'outline';
  const bg = primary ? c.accent : outline ? c.surface : 'transparent';
  const fg = primary ? c.onAccent : onBrand ? c.onPrimary : c.text;
  const borderColor = primary ? c.accent : outline ? c.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary && softShadow,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
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
    minHeight: Height.INPUT_S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.S,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.M,
    fontWeight: FontWeight.MEDIUM,
  },
});
