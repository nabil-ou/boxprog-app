import { StyleSheet, Text, View } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

export function initials(name: string | null | undefined) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

export function Avatar({ name, size = 34 }: { name: string | null | undefined; size?: number }) {
  const c = useBrand();
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.accent }]}>
      <Text style={{ color: c.onAccent, fontSize: size * 0.4, fontWeight: '700' }}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
