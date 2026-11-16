import { Check } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { BorderRadius, FontSize, FontWeight, Spacing, font, textStyles, tint } from '@/lib/theme';
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
  const t = textStyles(c);
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
              paddingTop: insets.top + Spacing.M,
              paddingBottom: Math.max(insets.bottom, Spacing.L),
              borderRightColor: c.border,
            },
          ]}>
          <Text style={t.titleSection}>Programmations</Text>
          <Text style={[t.body, { marginBottom: Spacing.XS }]}>Choisis la piste à afficher</Text>
          <View style={styles.list}>
            {tracks.map((track) => {
              const active = track.id === selectedId;
              return (
                <Pressable
                  key={track.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => onSelect(track)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: active ? tint(c.primary, 0.92, c.background) : pressed ? c.raised : 'transparent',
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <View style={[styles.dot, { backgroundColor: track.color || c.accent }]} />
                  <Text style={[styles.name, { color: c.text, fontFamily: active ? font.medium : font.regular }]}>
                    {track.name}
                  </Text>
                  {active ? <AppIcon icon={Check} size={18} color={c.primary} /> : null}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    maxWidth: 320,
    paddingHorizontal: Spacing.M,
    gap: Spacing.XS,
    borderRightWidth: 1,
  },
  list: {
    gap: Spacing.XXS,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.M,
    minHeight: 48,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
    fontSize: FontSize.S,
    fontWeight: FontWeight.NORMAL,
  },
});
