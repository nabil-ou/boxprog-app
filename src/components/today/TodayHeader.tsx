import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/components/Avatar';
import { DateScroller } from '@/components/today/DateScroller';
import { DayPickerModal } from '@/components/today/DayPickerModal';
import { addDays, mondayOf } from '@/lib/dates';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow, textStyles } from '@/lib/theme';
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
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { minDate, maxDate } = useMemo(() => {
    const start = mondayOf(addDays(today, -52 * 7));
    const end = addDays(start, 104 * 7 - 1);
    return { minDate: start, maxDate: end };
  }, [today]);

  return (
    <View style={[styles.wrap, { backgroundColor: c.primary, paddingTop: insets.top + Spacing.XS }]}>
      <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une programmation"
          onPress={onOpenTracks}
          style={({ pressed }) => [styles.iconBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
          {box.logo_url ? (
            <Image source={{ uri: box.logo_url }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.monogram, { backgroundColor: c.accent }]}>
              <Text style={[styles.monogramText, { color: c.onAccent }]}>{initials(box.name)}</Text>
            </View>
          )}
        </Pressable>
        <View style={styles.titleWrap} pointerEvents="none">
          <Text style={[t.titleSection, { color: c.onPrimary }]} numberOfLines={1}>
            {trackName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choisir une date"
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.iconBtn,
            softShadow,
            { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Ionicons name="calendar-outline" size={18} color={c.text} />
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
    paddingBottom: Spacing.XS,
    gap: Spacing.XS,
  },
  top: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.M,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 36,
    height: 36,
  },
  monogram: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.XS,
  },
});
