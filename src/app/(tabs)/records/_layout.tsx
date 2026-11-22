import { Stack } from 'expo-router';

import { useBrand } from '@/providers/BoxProvider';

export default function RecordsLayout() {
  const c = useBrand();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
