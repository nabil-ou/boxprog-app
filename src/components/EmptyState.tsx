import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

interface Props {
  icon: SymbolViewProps['name'];
  title: string;
  body: string;
}

export function EmptyState({ icon, title, body }: Props) {
  const c = useBrand();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.badge, { backgroundColor: c.primary }]}>
        <SymbolView name={icon} size={28} tintColor={c.accent} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Text style={[styles.body, { color: c.muted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
