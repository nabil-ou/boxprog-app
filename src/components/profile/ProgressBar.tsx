import { StyleSheet, View } from 'react-native';

import { BorderRadius } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function ProgressBar({
  value,
  height = 6,
}: {
  /** 0–100 */
  value: number;
  height?: number;
}) {
  const c = useBrand();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={[styles.track, { backgroundColor: c.raised, height, borderRadius: BorderRadius.FULL }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: c.accent,
            height,
            borderRadius: BorderRadius.FULL,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 0,
  },
});
