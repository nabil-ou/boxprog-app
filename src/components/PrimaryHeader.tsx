import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

/** Header bandeau primary — icône accent + titre centré + slot droit optionnel. */
export function PrimaryHeader({
  title,
  icon: Icon,
  right,
}: {
  title: string;
  icon: LucideIcon;
  right?: ReactNode;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { backgroundColor: c.primary, paddingTop: insets.top + Spacing.S }]}>
      <View style={styles.side}>
        <Icon size={22} color={c.accent} strokeWidth={APP_ICON_STROKE} />
      </View>
      <Text style={[styles.title, { color: c.onPrimary }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.M,
    gap: Spacing.XS,
  },
  side: {
    minWidth: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  spacer: { width: 22, height: 22 },
});
