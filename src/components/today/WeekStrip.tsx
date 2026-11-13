import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { dayNum, dowShort } from '@/lib/dates';
import { useBrand } from '@/providers/BoxProvider';

export function WeekStrip({
  days,
  value,
  today,
  onChange,
}: {
  days: string[];
  value: string;
  today: string;
  onChange: (day: string) => void;
}) {
  const c = useBrand();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {days.map((d) => {
        const selected = d === value;
        const isToday = d === today;
        return (
          <Pressable
            key={d}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(d)}
            style={[
              styles.day,
              selected && { borderColor: c.accent, backgroundColor: 'rgba(255,255,255,0.12)' },
              !selected && { borderColor: 'transparent' },
            ]}>
            <Text style={[styles.dow, { color: selected ? c.onPrimary : c.onPrimaryMuted }]}>{dowShort(d)}</Text>
            <Text style={[styles.num, { color: c.onPrimary, fontWeight: selected || isToday ? '800' : '600' }]}>
              {dayNum(d)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: 12,
    gap: 4,
    alignItems: 'center',
  },
  day: {
    minWidth: 48,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 2,
  },
  dow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  num: {
    fontSize: 17,
  },
});
