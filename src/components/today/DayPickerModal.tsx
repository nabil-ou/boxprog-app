import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { addDays, addMonths, monthGrid, monthTitle, startOfMonth, todayIso } from '@/lib/dates';
import { BorderRadius, FontSize, FontWeight, Height, Spacing, font, softShadow, textStyles } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_SIZE = 36;

export function DayPickerModal({
  open,
  value,
  today = todayIso(),
  minDate,
  maxDate,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: string;
  today?: string;
  minDate?: string;
  maxDate?: string;
  onSelect: (day: string) => void;
  onClose: () => void;
}) {
  const c = useBrand();
  const t = textStyles(c);
  const [month, setMonth] = useState(() => startOfMonth(value));

  useEffect(() => {
    if (open) setMonth(startOfMonth(value));
  }, [open, value]);

  const weeks = useMemo(() => {
    const cells = monthGrid(month);
    const rows: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month]);
  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);
  const canPrev = !minDate || addDays(month, -1) >= minDate;
  const canNext = !maxDate || nextMonth <= maxDate;

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.head}>
            <Pressable
              onPress={() => canPrev && setMonth(prevMonth)}
              disabled={!canPrev}
              hitSlop={10}
              style={[styles.navBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border, opacity: canPrev ? 1 : 0.3 }]}>
              <Ionicons name="chevron-back" size={18} color={c.text} />
            </Pressable>
            <Text style={t.titleSection}>{monthTitle(month)}</Text>
            <Pressable
              onPress={() => canNext && setMonth(nextMonth)}
              disabled={!canNext}
              hitSlop={10}
              style={[styles.navBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border, opacity: canNext ? 1 : 0.3 }]}>
              <Ionicons name="chevron-forward" size={18} color={c.text} />
            </Pressable>
          </View>

          <View style={styles.dowRow}>
            {DOW.map((d, i) => (
              <Text key={`${d}-${i}`} style={[styles.dow, { color: c.muted }]}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week, wi) => (
              <View key={`w-${wi}`} style={styles.week}>
                {week.map((day, di) => {
                  if (!day) return <View key={`e-${wi}-${di}`} style={styles.slot} />;
                  const selected = day === value;
                  const isToday = day === today;
                  const disabled = (minDate && day < minDate) || (maxDate && day > maxDate);
                  return (
                    <View key={day} style={styles.slot}>
                      <Pressable
                        disabled={!!disabled}
                        onPress={() => {
                          onSelect(day);
                          onClose();
                        }}
                        style={({ pressed }) => [
                          styles.day,
                          selected && { borderColor: c.accent },
                          !selected && isToday && { borderColor: c.border },
                          { opacity: disabled ? 0.3 : pressed ? 0.75 : 1 },
                        ]}>
                        <Text
                          style={[
                            styles.dayNum,
                            {
                              color: selected ? c.accent : c.text,
                              fontFamily: selected ? font.medium : font.regular,
                            },
                          ]}>
                          {Number(day.slice(8))}
                        </Text>
                        {isToday && !selected ? <View style={[styles.todayDot, { backgroundColor: c.muted }]} /> : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              onSelect(today);
              onClose();
            }}
            style={({ pressed }) => [
              styles.todayBtn,
              { backgroundColor: c.raised, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Text style={[t.label, { color: c.text }]}>Aujourd’hui</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.M,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    padding: Spacing.M,
    gap: Spacing.S,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dowRow: {
    flexDirection: 'row',
  },
  dow: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
  },
  grid: {
    gap: Spacing.XXS,
  },
  week: {
    flexDirection: 'row',
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.XXS,
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.NORMAL,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  todayBtn: {
    minHeight: Height.PRESSABLE_S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
