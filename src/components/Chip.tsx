import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font, radius, space, type as typeScale } from '@/lib/theme';
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
                backgroundColor: on ? c.primary : c.raised,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}>
            <Text style={[styles.label, { color: on ? c.onPrimary : c.secondary, fontFamily: on ? font.medium : font.regular }]}>
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
    gap: space[2],
  },
  chip: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.medium,
  },
});
