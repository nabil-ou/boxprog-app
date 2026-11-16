import { Check, ChevronRight, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import type { Session } from '@/lib/booking';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow, tint } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const SUCCESS = '#16A34A';

export function SessionSlotRow({
  item,
  onPress,
  variant = 'member',
}: {
  item: Session;
  onPress?: () => void;
  variant?: 'member' | 'staff';
}) {
  const c = useBrand();
  const booked = variant === 'member' && item.status === 'booked';
  const waiting = variant === 'member' && item.status === 'waitlist';
  const full = item.capacity != null && item.booked >= item.capacity;
  const remaining = item.capacity == null ? null : item.capacity - item.booked;
  const bg = booked ? tint(SUCCESS, 0.9, c.surface) : c.surface;

  const subtitle =
    variant === 'staff' ? (
      <>
        <Text style={[styles.spots, { color: c.muted }]}>
          {item.capacity == null
            ? `${item.booked} inscrit${item.booked > 1 ? 's' : ''}`
            : `${item.booked}/${item.capacity} place${item.capacity > 1 ? 's' : ''}`}
        </Text>
        {item.waitlist > 0 ? (
          <Text style={[styles.waitlist, { color: c.accent }]}>
            {item.waitlist} en liste d’attente
          </Text>
        ) : null}
      </>
    ) : booked ? (
      <View style={styles.statusRow}>
        <AppIcon icon={Check} size={14} color={SUCCESS} />
        <Text style={[styles.bookedLabel, { color: SUCCESS }]}>Réservé</Text>
      </View>
    ) : waiting ? (
      <Text style={[styles.waitlist, { color: c.accent }]}>Liste d’attente</Text>
    ) : full ? (
      <Text style={[styles.waitlist, { color: c.accent }]}>Complet · liste d’attente</Text>
    ) : remaining == null ? (
      <Text style={[styles.spots, { color: c.muted }]}>Ouvert</Text>
    ) : (
      <Text style={[styles.spots, { color: c.muted }]}>
        {remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
      </Text>
    );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        softShadow,
        {
          backgroundColor: bg,
          borderColor: booked ? tint(SUCCESS, 0.7, c.border) : c.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={styles.timeCol}>
        <Text style={[styles.start, { color: c.text }]}>{item.start}</Text>
        <Text style={[styles.end, { color: c.muted }]}>{item.end}</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <View style={styles.main}>
        <Text style={[styles.title, { color: c.text }]}>{item.type}</Text>
        {subtitle}
      </View>

      <View style={styles.right}>
        <View style={styles.capacity}>
          <AppIcon icon={Users} size={14} color={c.muted} />
          <Text style={[styles.capacityText, { color: c.muted }]}>
            {item.capacity == null ? item.booked : `${item.booked}/${item.capacity}`}
          </Text>
        </View>
        <AppIcon icon={ChevronRight} size={18} color={c.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingVertical: Spacing.M,
    paddingHorizontal: Spacing.M,
    borderRadius: BorderRadius.L,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  timeCol: {
    width: 52,
    gap: 2,
  },
  start: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  end: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 2,
  },
  main: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookedLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  waitlist: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
  },
  spots: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  capacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
});
