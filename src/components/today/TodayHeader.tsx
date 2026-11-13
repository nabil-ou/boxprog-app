import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/components/Avatar';
import { WeekStrip } from '@/components/today/WeekStrip';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function TodayHeader({
  trackName,
  days,
  day,
  today,
  onDayChange,
  onOpenTracks,
}: {
  trackName: string;
  days: string[];
  day: string;
  today: string;
  onDayChange: (day: string) => void;
  onOpenTracks: () => void;
}) {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { backgroundColor: c.primary, paddingTop: insets.top + 8 }]}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une programmation"
          onPress={onOpenTracks}
          style={({ pressed }) => [styles.logoBtn, { opacity: pressed ? 0.75 : 1 }]}>
          {box.logo_url ? (
            <Image source={{ uri: box.logo_url }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.monogram, { backgroundColor: c.accent }]}>
              <Text style={[styles.monogramText, { color: c.onAccent }]}>{initials(box.name)}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={[styles.title, { color: c.onPrimary }]} numberOfLines={1}>
            {trackName}
          </Text>
        </View>
        <View style={styles.logoBtn} />
      </View>
      <WeekStrip days={days} value={day} today={today} onChange={onDayChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 14,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoBtn: {
    width: 40,
    height: 40,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  monogram: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
});
