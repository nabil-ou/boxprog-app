import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { BoxProvider, useBox, useBrand } from '@/providers/BoxProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <BoxProvider>
        <RootStack />
      </BoxProvider>
    </AuthProvider>
  );
}

function RootStack() {
  const { access } = useBox();
  const { recovering } = useAuth();
  const c = useBrand();
  const booted = useRef(false);

  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, primary: c.ink, background: c.background, card: c.surface, text: c.text, border: c.border },
    }),
    [c],
  );

  useEffect(() => {
    if (access !== 'loading' && !booted.current) {
      booted.current = true;
      SplashScreen.hideAsync();
    }
  }, [access]);

  if (access === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary }}>
        <ActivityIndicator color={c.onPrimary} />
      </View>
    );
  }

  const waiting = access === 'pending' || access === 'blocked' || access === 'unavailable' || access === 'error';

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={recovering}>
          <Stack.Screen name="nouveau-mot-de-passe" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'signedOut'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'join'}>
          <Stack.Screen name="rejoindre" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && waiting}>
          <Stack.Screen name="en-attente" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'active'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="profil"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Mon profil',
              headerStyle: { backgroundColor: c.primary },
              headerTintColor: c.onPrimary,
            }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
