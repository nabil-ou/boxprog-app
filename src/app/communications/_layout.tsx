import { Stack } from 'expo-router';

import { FontSize, FontWeight, font } from '@/lib/theme';
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
      }}>
      <Stack.Screen name="index" options={{ title: 'À la une' }} />
      <Stack.Screen name="[id]" options={{ title: 'Communication' }} />
    </Stack>
  );
}
