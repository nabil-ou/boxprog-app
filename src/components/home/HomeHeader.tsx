import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { BoxLogoButton } from '@/components/BoxLogoButton';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const AVATAR_SIZE = 36;

export function HomeHeader({
  firstName,
  fullName,
  avatarUrl,
  onOpenMenu,
}: {
  firstName: string;
  fullName?: string;
  avatarUrl?: string | null;
  onOpenMenu: () => void;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const greeting = firstName ? `Salut ${firstName}` : 'Salut';

  return (
    <View style={[styles.wrap, { backgroundColor: c.primary, paddingTop: insets.top + Spacing.XS }]}>
      <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
      <View style={styles.row}>
        <BoxLogoButton onPress={onOpenMenu} />
        <Text style={[styles.greeting, { color: c.onPrimary }]} numberOfLines={1}>
          {greeting}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profil"
          onPress={() => router.push('/(tabs)/profil')}
          style={({ pressed }) => [
            styles.avatarRing,
            { borderColor: c.secondary, opacity: pressed ? 0.85 : 1 },
          ]}>
          <Avatar name={fullName || firstName || '?'} uri={avatarUrl} size={AVATAR_SIZE - 4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.S,
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
  },
  greeting: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: -0.3,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
