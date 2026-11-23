import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export default function CommunicationsLayout() {
  const c = useBrand();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
        headerTitleStyle: {
          fontFamily: font.semibold,
          fontWeight: FontWeight.SEMI_BOLD,
          fontSize: FontSize.L,
        },
        contentStyle: { backgroundColor: c.background },
        // Stack racine a headerShown: false → pas de chevron auto. Retour explicite.
        headerLeft: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            hitSlop={10}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)');
            }}
            style={{ paddingHorizontal: Spacing.XS, marginLeft: Spacing.XXS }}>
            <ChevronLeft size={22} color={c.text} strokeWidth={APP_ICON_STROKE} />
          </Pressable>
        ),
      }}>
      <Stack.Screen name="index" options={{ title: 'À la une' }} />
      <Stack.Screen name="[id]" options={{ title: 'Communication' }} />
    </Stack>
  );
}
