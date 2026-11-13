import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Track } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

export function TrackDrawer({
  open,
  tracks,
  selectedId,
  onSelect,
  onClose,
}: {
  open: boolean;
  tracks: Track[];
  selectedId: string | null;
  onSelect: (track: Track) => void;
  onClose: () => void;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <View
          style={[
            styles.panel,
            {
              backgroundColor: c.surface,
              paddingTop: insets.top + 16,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}>
          <Text style={[styles.heading, { color: c.text }]}>Programmations</Text>
          <Text style={[styles.sub, { color: c.muted }]}>Choisis la piste à afficher.</Text>
          <View style={styles.list}>
            {tracks.map((t) => {
              const active = t.id === selectedId;
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => onSelect(t)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: active ? mixSoft(c.primary) : pressed ? c.background : 'transparent',
                      borderColor: active ? c.primary : c.border,
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: t.color || c.accent }]} />
                  <Text style={[styles.name, { color: c.text }]}>{t.name}</Text>
                  {active ? <Text style={[styles.check, { color: c.primary }]}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function mixSoft(hex: string) {
  // Fond léger à partir de la primary (≈ 12 % d'opacité simulée sur blanc).
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#F3F4F6';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (v: number) => Math.round(v * 0.12 + 255 * 0.88);
  return `#${[r, g, b].map((v) => mix(v).toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    maxWidth: 320,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    fontSize: 15,
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  check: {
    fontSize: 18,
    fontWeight: '800',
  },
});
