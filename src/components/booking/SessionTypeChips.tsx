import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function SessionTypeChips({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const c = useBrand();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((chip) => {
        const active = chip.value === value;
        return (
          <Pressable
            key={chip.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(chip.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? c.primary : c.raised,
                borderColor: active ? c.accent : c.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Text style={[styles.label, { color: active ? c.onPrimary : c.text }]}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.XS,
    paddingHorizontal: Spacing.M,
  },
  chip: {
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.XS,
    borderRadius: BorderRadius.XL,
    borderWidth: 1.5,
    minHeight: 34,
    justifyContent: 'center',
  },
  label: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
});
