import { Stack } from 'expo-router';

import { ChronoProvider } from '@/providers/ChronoProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function ChronoLayout() {
  const c = useBrand();

  return (
    <ChronoProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: c.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="run" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </ChronoProvider>
  );
}
