import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { APP_ICON_STROKE, AppIcon } from '@/components/AppIcon';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  destructive,
  busy,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  busy?: boolean;
}) {
  const c = useBrand();
  const color = destructive ? c.danger : c.text;
  const body = (
    <View style={styles.row}>
      <AppIcon icon={icon} size={18} color={destructive ? c.danger : c.muted} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      {busy ? <ActivityIndicator color={c.muted} /> : null}
      {!busy && value ? (
        <Text style={[styles.value, { color: c.muted }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress && !busy ? <ChevronRight size={18} color={c.muted} strokeWidth={APP_ICON_STROKE} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => ({ opacity: pressed || busy ? 0.7 : 1 })}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    minHeight: 28,
  },
  label: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  value: {
    flexShrink: 1,
    maxWidth: '46%',
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
});
