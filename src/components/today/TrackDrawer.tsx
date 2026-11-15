import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, radius, space, tint, type as typeScale } from '@/lib/theme';
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
              paddingTop: insets.top + space[4],
              paddingBottom: Math.max(insets.bottom, space[6]),
              borderRightColor: c.border,
            },
          ]}>
          <Text style={[styles.heading, { color: c.text, fontFamily: font.semibold }]}>Programmations</Text>
          <Text style={[styles.sub, { color: c.muted }]}>Choisis la piste à afficher</Text>
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
                      backgroundColor: active ? tint(c.primary, 0.92) : pressed ? c.raised : 'transparent',
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: t.color || c.accent }]} />
                  <Text style={[styles.name, { color: c.text, fontFamily: active ? font.medium : font.regular }]}>
                    {t.name}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={18} color={c.primary} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
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
    paddingHorizontal: space[4],
    gap: space[2],
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  heading: {
    fontSize: typeScale.xl,
    fontWeight: typeScale.weight.semibold,
  },
  sub: {
    fontSize: typeScale.md,
    marginBottom: space[2],
  },
  list: {
    gap: space[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    minHeight: 48,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontSize: typeScale.lg,
    fontWeight: typeScale.weight.regular,
  },
});
