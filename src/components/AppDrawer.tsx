import { router } from 'expo-router';
import { CalendarDays, Check, Timer, User } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { BorderRadius, FontSize, FontWeight, Spacing, font, textStyles, tint } from '@/lib/theme';
import type { Track } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

const STAFF_ROLES = new Set(['owner', 'admin', 'coach']);

export function AppDrawer({
  open,
  onClose,
  tracks,
  selectedId,
  onSelectTrack,
}: {
  open: boolean;
  onClose: () => void;
  tracks?: Track[];
  selectedId?: string | null;
  onSelectTrack?: (track: Track) => void;
}) {
  const c = useBrand();
  const t = textStyles(c);
  const box = useActiveBox();
  const insets = useSafeAreaInsets();
  const showTracks = Boolean(tracks?.length && onSelectTrack);
  const isStaff = Boolean(box.my_role && STAFF_ROLES.has(box.my_role));

  const go = (href: '/(tabs)/planning' | '/(tabs)/chrono' | '/(tabs)/profil') => {
    onClose();
    router.push(href);
  };

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
          <Text style={t.titleSection}>Menu</Text>
          <View style={styles.list}>
            {isStaff ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => go('/(tabs)/planning')}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: pressed ? c.raised : 'transparent', opacity: pressed ? 0.9 : 1 },
                ]}>
                <AppIcon icon={CalendarDays} size={18} color={c.primary} />
                <Text style={[styles.name, { color: c.text }]}>Planning</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => go('/(tabs)/chrono')}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? c.raised : 'transparent', opacity: pressed ? 0.9 : 1 },
              ]}>
              <AppIcon icon={Timer} size={18} color={c.primary} />
              <Text style={[styles.name, { color: c.text }]}>Chrono</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => go('/(tabs)/profil')}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? c.raised : 'transparent', opacity: pressed ? 0.9 : 1 },
              ]}>
              <AppIcon icon={User} size={18} color={c.primary} />
              <Text style={[styles.name, { color: c.text }]}>Profil</Text>
            </Pressable>
          </View>

          {showTracks ? (
            <>
              <Text style={[t.titleSection, { marginTop: Spacing.L }]}>Programmations</Text>
              <Text style={[t.body, { marginBottom: Spacing.XS }]}>Choisis la piste à afficher</Text>
              <View style={styles.list}>
                {tracks!.map((track) => {
                  const active = track.id === selectedId;
                  return (
                    <Pressable
                      key={track.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => onSelectTrack!(track)}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: active
                            ? tint(c.primary, 0.92, c.background)
                            : pressed
                              ? c.raised
                              : 'transparent',
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}>
                      <View style={[styles.dot, { backgroundColor: track.color || c.accent }]} />
                      <Text
                        style={[
                          styles.name,
                          { color: c.text, fontFamily: active ? font.medium : font.regular },
                        ]}>
                        {track.name}
                      </Text>
                      {active ? <AppIcon icon={Check} size={18} color={c.primary} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
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
    fontFamily: font.regular,
  },
});
