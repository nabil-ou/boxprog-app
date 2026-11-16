import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import type { MockReservation } from '@/components/home/mock';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function ReservationCard({ item, onPress }: { item: MockReservation; onPress?: () => void }) {
  const c = useBrand();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        softShadow,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
          borderLeftColor: c.accent,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.tag, { backgroundColor: c.primary }]}>
          <Text style={[styles.tagText, { color: c.onPrimary }]}>{item.tag}</Text>
        </View>
        <View style={styles.status}>
          <AppIcon icon={Check} size={14} color={item.status === 'Confirmé' ? '#16A34A' : c.accent} />
          <Text style={[styles.statusText, { color: item.status === 'Confirmé' ? '#16A34A' : c.accent }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
        <Text style={[styles.time, { color: c.text }]}>{item.time}</Text>
      </View>
      <Text style={[styles.meta, { color: c.muted }]}>{item.meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: BorderRadius.L,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: Spacing.M,
    gap: Spacing.XS,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.XS,
  },
  tag: {
    paddingHorizontal: Spacing.XS,
    paddingVertical: 3,
    borderRadius: BorderRadius.XS,
  },
  tagText: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 0.4,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.MEDIUM,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.S,
    marginTop: Spacing.XXS,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  time: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
});
