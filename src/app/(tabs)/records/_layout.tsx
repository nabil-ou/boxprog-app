import { Stack } from 'expo-router';

import { useBrand } from '@/providers/BoxProvider';
import { RecordsProvider } from '@/providers/RecordsProvider';

export default function RecordsLayout() {
  const c = useBrand();

  return (
    <RecordsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: c.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
      </Stack>
    </RecordsProvider>
  );
}
