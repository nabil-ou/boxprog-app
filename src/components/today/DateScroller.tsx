import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import {
  addDays,
  dayNum,
  dowShort,
  fullWeek,
  isoDow,
  mondayOf,
  todayIso,
} from "@/lib/dates";
import { BorderRadius, FontSize, FontWeight, Spacing, font } from "@/lib/theme";
import { useBrand } from "@/providers/BoxProvider";

const CENTER_WEEK_INDEX = 52;
const WEEKS_COUNT = CENTER_WEEK_INDEX * 2;

function buildWeeks(anchorToday: string): string[][] {
  const startMonday = mondayOf(addDays(anchorToday, -CENTER_WEEK_INDEX * 7));
  return Array.from({ length: WEEKS_COUNT }, (_, w) =>
    fullWeek(addDays(startMonday, w * 7)),
  );
}

function weekIndexOf(weeks: string[][], day: string): number {
  return weeks.findIndex((week) => week.includes(day));
}

export function DateScroller({
  value,
  today = todayIso(),
  minDate,
  onChange,
}: {
  value: string;
  today?: string;
  minDate?: string;
  onChange: (day: string) => void;
}) {
  const { width } = useWindowDimensions();
  const weekWidth = width;
  const weeks = useMemo(() => buildWeeks(today), [today]);
  const listRef = useRef<FlatList<string[]>>(null);
  const lastWeekday = useRef(isoDow(value));
  const currentWeekIndex = useRef(Math.max(0, weekIndexOf(weeks, value)));
  const fromScroll = useRef(false);
  const userDragged = useRef(false);
  const scrolling = useRef(false);
  const lastValue = useRef(value);
  const pendingScroll = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (lastValue.current !== value) {
    if (!fromScroll.current) lastWeekday.current = isoDow(value);
    lastValue.current = value;
    fromScroll.current = false;
  }

  const scrollToWeek = useCallback(
    (index: number, animated: boolean) => {
      if (pendingScroll.current) clearTimeout(pendingScroll.current);
      currentWeekIndex.current = index;
      pendingScroll.current = setTimeout(() => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({
            offset: index * weekWidth,
            animated,
          });
        });
      }, 50);
    },
    [weekWidth],
  );

  useEffect(() => {
    const idx = weekIndexOf(weeks, value);
    if (idx !== -1) scrollToWeek(idx, false);
    return () => {
      if (pendingScroll.current) clearTimeout(pendingScroll.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrolling.current) return;
    const idx = weekIndexOf(weeks, value);
    if (idx === -1 || idx === currentWeekIndex.current) return;
    scrollToWeek(idx, true);
  }, [value, weeks, scrollToWeek]);

  const onDayPress = (day: string) => {
    if (minDate && day < minDate) return;
    fromScroll.current = false;
    lastWeekday.current = isoDow(day);
    onChange(day);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!userDragged.current) return;
    userDragged.current = false;
    const idx = Math.round(e.nativeEvent.contentOffset.x / weekWidth);
    if (idx === currentWeekIndex.current) return;
    currentWeekIndex.current = idx;
    fromScroll.current = true;
    const week = weeks[idx];
    if (!week) return;
    const preferred =
      week.find((d) => isoDow(d) === lastWeekday.current) ?? week[0];
    const valid =
      minDate && preferred < minDate
        ? (week.find((d) => d >= minDate) ?? minDate)
        : preferred;
    onChange(valid);
  };

  const renderWeek = useCallback(
    ({ item }: { item: string[] }) => (
      <View style={[styles.week, { width: weekWidth }]}>
        {item.map((day) => (
          <DayCell
            key={day}
            day={day}
            selected={day === value}
            isToday={day === today}
            disabled={Boolean(minDate && day < minDate)}
            onPress={() => onDayPress(day)}
          />
        ))}
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekWidth, value, today, minDate],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(_, i) => `week-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        onScrollBeginDrag={() => {
          scrolling.current = true;
          userDragged.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            scrolling.current = false;
          }, 300);
        }}
        getItemLayout={(_, index) => ({
          length: weekWidth,
          offset: weekWidth * index,
          index,
        })}
        initialScrollIndex={currentWeekIndex.current}
        windowSize={5}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        extraData={`${value}:${minDate ?? ""}`}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToOffset({
              offset: info.index * weekWidth,
              animated: true,
            });
          }, 500);
        }}
      />
    </View>
  );
}

function DayCell({
  day,
  selected,
  isToday,
  disabled,
  onPress,
}: {
  day: string;
  selected: boolean;
  isToday: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const c = useBrand();
  const ink = selected ? c.accent : c.onPrimary;
  const label = selected ? c.accent : c.onPrimaryMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        { opacity: disabled ? 0.28 : pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.cell,
          selected && styles.cellSelected,
          { borderColor: selected ? c.accent : "transparent" },
        ]}
      >
        <Text
          style={[
            styles.dow,
            { color: label, fontFamily: selected ? font.medium : font.regular },
          ]}
        >
          {dowShort(day)}
        </Text>
        <Text
          style={[
            styles.num,
            {
              color: ink,
              fontFamily: selected || isToday ? font.semibold : font.regular,
            },
          ]}
        >
          {dayNum(day)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.XS,
  },
  week: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.M,
  },
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.XS,
    paddingHorizontal: Spacing.XXS,
    gap: 2,
    minWidth: 36,
    borderWidth: 1,
    borderRadius: BorderRadius.S,
  },
  cellSelected: {
    paddingHorizontal: 6,
    width: 42,
  },
  dow: {
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
    lineHeight: 14,
  },
  num: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.NORMAL,
    lineHeight: 20,
  },
});
