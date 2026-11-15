import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

/** Header bandeau primary — même structure que Chrono (icône accent + titre centré). */
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
      <Icon size={22} color={c.accent} strokeWidth={APP_ICON_STROKE} />
      <Text style={[styles.title, { color: c.onPrimary }]}>{title}</Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.M,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
    marginRight: 22,
  },
  spacer: { width: 22 },
});
