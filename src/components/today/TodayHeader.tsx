import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { BoxLogoButton } from '@/components/BoxLogoButton';
import { DateScroller } from '@/components/today/DateScroller';
import { DayPickerModal } from '@/components/today/DayPickerModal';
import { addDays, mondayOf } from '@/lib/dates';
import { BorderRadius, Spacing, softShadow, textStyles } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function TodayHeader({
  trackName,
  day,
  today,
  onDayChange,
  onOpenMenu,
}: {
  trackName: string;
  day: string;
  today: string;
  onDayChange: (day: string) => void;
  onOpenMenu: () => void;
}) {
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
        <BoxLogoButton onPress={onOpenMenu} label="Ouvrir le menu" />
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
          <AppIcon icon={Calendar} size={18} color={c.text} />
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
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.XS,
  },
});
