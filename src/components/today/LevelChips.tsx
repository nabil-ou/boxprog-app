import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LEVELS, type Level } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

export function LevelChips({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  const c = useBrand();
  return (
    <View style={styles.row}>
      {LEVELS.map((l) => {
        const on = l === value;
        return (
          <Pressable
            key={l}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(l)}
            style={[
              styles.chip,
              {
                backgroundColor: on ? c.primary : c.background,
                borderColor: on ? c.primary : c.border,
              },
            ]}>
            <Text style={[styles.label, { color: on ? c.onPrimary : c.text }]}>{l}</Text>
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
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
