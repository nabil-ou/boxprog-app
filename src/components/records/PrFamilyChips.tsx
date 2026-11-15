import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { PrFamily, PrFamilyId } from '@/lib/records';
import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function PrFamilyChips({
  families,
  value,
  onChange,
}: {
  families: PrFamily[];
  value: PrFamilyId | 'all';
  onChange: (id: PrFamilyId | 'all') => void;
}) {
  const c = useBrand();
  const chips: { id: PrFamilyId | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous' },
    ...families.map((f) => ({ id: f.id, label: f.label })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(chip.id)}
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
    paddingRight: Spacing.M,
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
