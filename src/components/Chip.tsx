import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useBrand();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: c.surface,
                borderColor: on ? c.text : c.border,
                borderWidth: on ? 2 : 1,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: c.text,
                  fontFamily: on ? font.medium : font.regular,
                },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.XS,
  },
  chip: {
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.XS,
    borderRadius: BorderRadius.XL,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
});
