import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/components/Avatar';
import { DateScroller } from '@/components/today/DateScroller';
import { DayPickerModal } from '@/components/today/DayPickerModal';
import { addDays, mondayOf } from '@/lib/dates';
import { font, radius, space, type as typeScale } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function TodayHeader({
  trackName,
  day,
  today,
  onDayChange,
  onOpenTracks,
}: {
  trackName: string;
  day: string;
  today: string;
  onDayChange: (day: string) => void;
  onOpenTracks: () => void;
}) {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { minDate, maxDate } = useMemo(() => {
    const start = mondayOf(addDays(today, -52 * 7));
    const end = addDays(start, 104 * 7 - 1);
    return { minDate: start, maxDate: end };
  }, [today]);

  return (
    <View style={[styles.wrap, { backgroundColor: c.primary, paddingTop: insets.top + space[2] }]}>
      <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
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
              <Text style={[styles.monogramText, { color: c.onAccent, fontFamily: font.semibold }]}>
                {initials(box.name)}
              </Text>
            </View>
          )}
        </Pressable>
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={[styles.title, { color: c.onPrimary, fontFamily: font.semibold }]} numberOfLines={1}>
            {trackName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une date"
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.logoBtn, styles.calBtn, { opacity: pressed ? 0.75 : 1 }]}>
          <Ionicons name="calendar-outline" size={22} color={c.onPrimary} />
        </Pressable>
      </View>
      <DateScroller value={day} today={today} onChange={onDayChange} />
      <DayPickerModal
        open={pickerOpen}
        value={day}
        today={today}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={onDayChange}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: space[2],
    gap: space[2],
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[4],
  },
  logoBtn: {
    width: 36,
    height: 36,
  },
  calBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
  },
  monogram: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: typeScale.sm,
    fontWeight: typeScale.weight.semibold,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: space[2],
  },
  title: {
    fontSize: typeScale.xl,
    fontWeight: typeScale.weight.semibold,
  },
});
