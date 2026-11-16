import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { initials } from '@/components/Avatar';
import { BorderRadius, FontSize, FontWeight, font, softShadow } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function BoxLogoButton({ onPress, label = 'Ouvrir le menu' }: { onPress: () => void; label?: string }) {
  const box = useActiveBox();
  const c = useBrand();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        softShadow,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      {box.logo_url ? (
        <Image source={{ uri: box.logo_url }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.monogram, { backgroundColor: c.accent }]}>
          <Text style={[styles.monogramText, { color: c.onAccent }]}>{initials(box.name)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
